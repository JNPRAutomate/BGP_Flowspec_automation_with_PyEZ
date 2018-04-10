import random
import StringIO
import yaml
import pprint

from jinja2 import Environment, FileSystemLoader
from jnpr.junos.utils.config import Config
from jnpr.junos import Device
from jnpr.junos.exception import ConfigLoadError

if __name__ == '__main__':

    print 'Generate static BGP Flow Spec test data on RR device'

    with open('../ui/config.yml', 'r') as fp:
        _config = fp.read()
        config = yaml.safe_load(_config)
        dev_user = config['dev_user']
        dev_pw = config['dev_pw']
        routers = config['routers']
        communities = config['communities']

    my_router = None
    for router in routers:

        for name, value in router.iteritems():
            if 'rr' in value['type']:
                my_router = [value['ip']]

    with Device(host=my_router[0], user=dev_user, password=dev_pw) as dev:

        testdata = dict()
        start = 1
        stop = 1001
        step = 1
        protocol = ['tcp', 'udp']
        action = ['accept', 'discard', 'sample', 'community']

        for idx in range(start, stop, step):
            testdata['flowRoute' + str(idx)] = {
                'dstPrefix': '10.{0}.{1}.{2}/32'.format(random.randint(1, 200), random.randint(1, 200),
                                                        random.randint(1, 200)),
                'srcPrefix': '10.{0}.{1}.{2}/32'.format(random.randint(1, 200), random.randint(1, 200),
                                                        random.randint(1, 200)),
                'protocol': protocol[random.randint(0, 1)], 'dstPort': '{0}'.format(random.randint(1, 9999)),
                'srcPort': '{0}'.format(random.randint(1, 9999)),
                'action': '{0} {1}'.format(action[3],communities[random.randint(0, len(communities)-1)]) if 'community' in action[
                    random.randint(0, 3)] else action[random.randint(0, 2)]}

        env = Environment(autoescape=False,
                          loader=FileSystemLoader('../template'), trim_blocks=False, lstrip_blocks=False)
        template = env.get_template('set-flow-route.conf')

        _template = StringIO.StringIO()

        for key, flow in testdata.iteritems():
            _template.write(template.render(flowRouteName=key, **flow))

        try:

            cu = Config(dev)
            cu.lock()
            cu.load(_template.getvalue(), format='text', merge=True)
            cu.commit()
            cu.unlock()

        except ConfigLoadError as cle:
            print cle.message
        
        _template.close()

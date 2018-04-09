import random
import StringIO
import pprint

from jinja2 import Environment, FileSystemLoader
from jnpr.junos.utils.config import Config
from jnpr.junos import Device
from jnpr.junos.exception import ConfigLoadError

if __name__ == '__main__':

    print 'Generate static BGP Flow Spec test data on RR device'

    with Device(host='10.11.111.120', user='root', password='juniper123') as dev:

        testdata = dict()
        start = 1
        stop = 101
        step = 1
        protocol = ['tcp', 'udp']
        action = ['accept', 'discard', 'sample']

        for idx in range(start, stop, step):
            testdata['flowRoute' + str(idx)] = {
                'dstPrefix': '10.{0}.{1}.{2}/32'.format(random.randint(1, 100), random.randint(1, 100),
                                                        random.randint(1, 100)),
                'srcPrefix': '10.{0}.{1}.{2}/32'.format(random.randint(1, 100), random.randint(1, 100),
                                                        random.randint(1, 100)),
                'protocol': protocol[random.randint(0, 1)], 'dstPort': '{0}'.format(random.randint(1, 9999)),
                'srcPort': '{0}'.format(random.randint(1, 9999)), 'action': action[random.randint(0, 2)]}

        # pprint.pprint(testdata)

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
# Demo BGP Flow Spec with PyEZ #


## Overview ##
This tool is to demo flow route creation / modification / deletion during PoC.
Features

- Flow Route actions
  + Add new flow route
  + Modify flow route
  + Delete flow route
- Display current flow routes in configuration
- Display current active flow routes in inetflow.0 table

## Installation ##

![Screen_Shot_2018-04-05_at_11.18.50](/uploads/9dc1f9063ca44f3c5be07cc9f48f92dc/Screen_Shot_2018-04-05_at_11.18.50.png)

![Screen_Shot_2018-04-05_at_11.18.35](/uploads/da39dbbac9843143cf2d1bbbdf88f1b6/Screen_Shot_2018-04-05_at_11.18.35.png)

- Get `Centos 7` box ready
- Log into to Centos 7 box via SSH
- Install required packages 
```bash
yum install python-devel libxml2-devel libxslt-devel gcc openssl libffi-devel wget curl
yum groupinstall "Development tools"
yum install zlib-devel bzip2-devel openssl-devel ncurses-devel sqlite-devel socat dhcp dnsmasq
```
- Install python 2.7
```bash
cd /usr/src
wget https://www.python.org/ftp/python/2.7.14/Python-2.7.14.tgz
tar xzf Python-2.7.14.tgz
cd Python-2.7.14
./configure
make altinstall
```
- Install BFS Demo Tool
```bash
git clone https://git.juniper.net/cklewar/bfs.git
cd bfs
pip install -r requirements.txt
```
- Edit `ui/config.yml` and change to settings to fit your environment
```yaml
age_out_interval: 00:01:00
dev_ip: 10.11.111.120
dev_pw: juniper123
dev_user: root
```
- Start tool with python2.7 main.py
- Access WebUi URL `<IP>:8080`
    
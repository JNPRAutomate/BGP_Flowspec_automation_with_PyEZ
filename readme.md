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

## Requirements ##

- Linux Box (Centos 7)
  + 1 CPU
  + 1G RAM
- Python 2.7
- Working internet connection 
  + WebUI loads needed javascript libraries and CSS files from CDN
- vMX 
  + Tested with version 14.1R1 / 17.1R1

## Installation ##
All steps should be done as `root` user.

- Get `Centos 7` box ready
  + http://isoredirect.centos.org/centos/7/isos/x86_64/CentOS-7-x86_64-Minimal-1708.iso
  + Turn off SELinux `setstatus // setenforce 0`
  + Turn off firewall `systemctl stop firewalld`
- Log into to Centos 7 box via SSH
- Install required packages if needed (This step is only needed if we have to install a newer python version)
  + Centos 7.x should come with python 2.7.5 
  + With the next steps we would install python 2.7.14 which is not needed if 2.7.5 is installed 

```bash
yum install python-devel libxml2-devel libxslt-devel gcc openssl libffi-devel wget curl
yum groupinstall "Development tools"
yum install zlib-devel bzip2-devel openssl-devel ncurses-devel sqlite-devel
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
  + pip2.7 should be directly available if not use `which pip2.7` to obtain the path to binary

```bash
git clone https://git.juniper.net/cklewar/bfs.git
cd bfs
pip2.7 or pip install --upgrade -r requirements.txt
```
- Edit `ui/config.yml` and change to settings to fit your environment

One RR configuration is mandatory.

```yaml
age_out_interval: 00:01:00
dev_pw: juniper123
dev_user: root
routers:
  - rt1:
      type: rr
      ip: 10.11.111.120
  - rt2:
      type: asbr
      ip: 10.11.111.121
```

- Start bfs tool
  + Python binary should be in path if not use `which python2.7` to obtain path info
  + change directory to bfs root
  + Start UI with `python2.7 main.py or python main.py`
- Access WebUI URL `<IP>:8080`

## WebUI ##

![Screen_Shot_2018-04-11_at_11.25.39](/uploads/98a7c849299a199daaf128ca109fd02a/Screen_Shot_2018-04-11_at_11.25.39.png)

![Screen_Shot_2018-04-11_at_11.26.18](/uploads/947d4ccd19c25e641dec4db29c0baab6/Screen_Shot_2018-04-11_at_11.26.18.png)

![Screen_Shot_2018-04-11_at_11.26.31](/uploads/c45d7ac851328b76562dc5c09356aa9d/Screen_Shot_2018-04-11_at_11.26.31.png)

![Screen_Shot_2018-04-11_at_11.26.53](/uploads/5ce8568b284dca5f0de6dc38564a66e1/Screen_Shot_2018-04-11_at_11.26.53.png)

![Screen_Shot_2018-04-11_at_11.26.42](/uploads/041a730956370aecc7661443ea01d636/Screen_Shot_2018-04-11_at_11.26.42.png)






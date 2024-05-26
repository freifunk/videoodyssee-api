# Ansible Automation

## Preparation

1. Install Ansible using [this](https://docs.ansible.com/ansible/latest/installation_guide/intro_installation.html) installation guide.

2. Install roles:

     ```ansible-galaxy install geerlingguy.apache```
     
    ```ansible-galaxy install geerlingguy.certbot```
    
   
## Configuration setup
1. After cloning the repo navigate to the repository.
2. Edit the Ansible env template file for to set your corresponding env variables using below command.


    ```nano ansible/roles/deploy_videoodyssee_api/templates/videoodyssee-api.env.j2```
3. This env file will look like this


    ```  
    PORT=8000
    ACCESS_KEY=12345f6af70744ced56773f47ef87d5a351234
    API_KEY=12345f6af70744ced56773f47ef87d5a351234
    JWT_SECRET = "THISISJUSTATESTSECRETFORJWT"
    EMAIL="admin@freifunk.net"
    PASSWORD="test123"
    PIPELINE_URL=https://videopipeline.freifunk.net/go/api/pipelines/processing-pipeline/schedule
    VOCTOWEB_URL=http://media.freifunk.net:3000
    
    ```
4. You can get the GOCD ACCESS_KEY from your GoCD server. You can read more about GoCD access tokens [here](https://docs.gocd.org/current/configuration/access_tokens.html).
5. API_KEY is the API key of VOCTOWEB.
6. JWT_SECRET is a secret key which will used for JWT authentication.
7. Email and password will the credentials of our videodyssee dashboard.
8. Replace the PIPELINE_URL and VOCTOWEB_URL with your pipline and voctoweb addresses.


## Deploy
1. Naviagate to the ansible folder.

2 . Update the hosts.yaml file with your api domain name. The hosts.yaml file will look like this


   ```
       all:
       children:
         api:
           hosts:
             api.videopipeline.freifunk.net:
               domains:
                 - api.videopipeline.freifunk.net
               email: web+api.videopipeline@freifunk.net
   ```
   
3. Then run the videoodyssee-api-playbook.yaml playbook using the below command:

`ansible-playbook -i hosts.yaml videoodyssee-api-playbook.yaml  -u vm_username --ask-become-pass`

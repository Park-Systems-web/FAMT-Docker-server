pipeline {
  agent any
  stages {
    stage('prepare') {
      steps {
        echo 'prepare'
          git branch: "main", credentialsId: "famt-git-credential", url: 'https://github.com/Park-Systems-web/FAMT-Docker-server.git'
          sh  'ls -al'
      }
    }
    stage('server-deploy') {
      steps {
        sh '''
        ls -al
        echo "JWT_SECRET=${JWT_SECRET_EXT}\nSMTP_EMAIL=${SMTP_EMAIL_EXT}\nSMTP_PASS=${SMTP_PASS_EXT}\nZOOM_API_KEY=${ZOOM_API_KEY_EXT}\nZOOM_API_SECRET=${ZOOM_API_SECRET_EXT}TZ=${TZ_EXT}" >> .env
        echo '{"host":"ec2-18-144-161-137.us-west-1.compute.amazonaws.com","user":"root","password":"${DB_PASS_EXT}","port":"3307","database":"famt"}' >> database.json
        sudo docker build -f Dockerfile -t server .
        sudo docker container stop server
        sudo docker container rm server
        sudo docker run --name server -d -p 5001:5000 server
        '''
      }
    }
    stage('cleanup') {
      steps {
        sh '''
        sudo docker rmi $(sudo docker images -f "dangling=true" -q)
        '''
        cleanWs()
      }
    }    
  }
}
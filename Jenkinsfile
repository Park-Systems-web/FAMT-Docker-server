pipeline {
  agent any
  stages {
    stage('prepare') {
      steps {
        echo 'prepare'
          git branch: "main", credentialsId: "famt-git-credential", url: 'https://github.com/Park-Systems-web/FAMT-Docker.git'
          sh  'ls -al'
      }
    }
    stage('server-deploy') {
      steps {
        dir('server'){
            sh '''
            ls -al
            sudo docker build -f Dockerfile -t server .
            sudo docker container stop server
            sudo docker container rm server
            sudo docker run --name server -d -p 5001:5000 server
            '''
        }
      }
    }
        
  }
}
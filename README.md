https://developers.strava.com/docs/getting-started/
https://developers.strava.com/docs/authentication/

## MITM Proxy

https://medium.com/@gaikwadchetan93/monitoring-modifying-android-app-network-traffic-via-mitm-proxy-part-1-886f6324f705
https://blog.apify.com/using-a-man-in-the-middle-proxy-to-scrape-data-from-a-mobile-app-api-e954915f979d
https://mitmproxy.org/
https://medium.com/testvagrant/intercept-ios-android-network-calls-using-mitmproxy-4d3c94831f62
https://docs.mitmproxy.org/stable/concepts-howmitmproxyworks/
https://www.stut-it.net/blog/2017/mitmproxy-cheatsheet.html

```
brew install mitmproxy
mitmproxy
```

```
On your iPhone
Settings -> Wi-Fi -> Select Network -> Configure Proxy -> Manual
Set server and port to whatever is your local ip address and then port 8080.
```
^^ Not sure if this works anymore

## Running script locally

`ts-node src/jobs.ts`

# To deploy, I used an AWS Lambda

## Do the first time

- [Install docker](https://docs.docker.com/install/)

# Running Lambda locally

- `docker build . -t strong-sharing`
- `docker run --env-file .env --rm -p 8080:8080 strong-sharing`
- `aws --profile personal lambda invoke --region us-east-1 --endpoint http://localhost:8080 --no-sign-request --function-name function --cli-binary-format raw-in-base64-out --payload '{"action": "pullNewWorkouts"}' output.txt`

---

# Pushing Lambda container image to ECR

## First time only

-  Login to ECR (you may have to do this again to re-authenticate)
  - `aws --profile personal ecr get-login-password  --region us-east-1 | docker login --username AWS --password-stdin {REPLACE_WITH_AWS_ACCOUNT_ID}.dkr.ecr.us-east-1.amazonaws.com`
- Create a new repository in ECR to store the Lambda function
  - `aws --profile personal ecr create-repository --repository-name strong-sharing --image-scanning-configuration scanOnPush=true`

## Execute all steps

- `export DOCKER_REGISTRY={AWS_ACCOUNT_ID}.dkr.ecr.us-east-1.amazonaws.com && make docker_build_and_push`
- Then make sure to hit the button "Deploy new image" on the Lambda console

OR

## Build 

- `docker build . -t strong-sharing` or `make build`

## Push

- `docker tag strong-sharing {REPLACE_WITH_AWS_ACCOUNT_ID}.dkr.ecr.us-east-1.amazonaws.com/strong-sharing:latest` or `make tag`
- `docker push {REPLACE_WITH_AWS_ACCOUNT_ID}.dkr.ecr.us-east-1.amazonaws.com/strong-sharing:latest`

---

## Setup Lambda

- We'll use an EventBridge (CloudWatch Events) as a trigger
- Create some test events. Here is an Pull New Workouts event
```
{
  "action": "pullNewWorkouts",
}
```

---

# Additional Docker Setup or Debugging

- [Install docker](https://docs.docker.com/install/)
- Build docker images: `docker build . -t strong-sharing`
- Run docker image: `docker run -p 49160:8080 -d strong-sharing`
  - or `docker run -p 9000:8080 -d strong-sharing`
- Debugging
  - List containers (with container id) - `docker ps`
  - Show logs - `docker logs [container id]`
- To enter the machine: `docker exec -it [container id] /bin/bash`
- Kill docker image: `docker kill [container id]`

---`



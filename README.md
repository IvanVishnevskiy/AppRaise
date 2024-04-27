
# AppRaise

Test assessment

  

# Set up DB

```
CREATE USER 'assessment'@'localhost' IDENTIFIED BY 'password';

CREATE DATABASE app
```

# Server
```
cd ./api
yarn && yarn start
```

# Client
```
cd ./web
yarn && yarn run dev
```

Visit [localhost:3001](http://localhost:3001) to use the app.
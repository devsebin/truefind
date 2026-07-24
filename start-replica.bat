@echo off
start "" /B mongod --port 27017 --dbpath "C:\data\db" --replSet rs0 --bind_ip localhost
start "" /B mongod --port 27018 --dbpath "C:\data\db1" --replSet rs0 --bind_ip localhost
start "" /B mongod --port 27019 --dbpath "C:\data\db2" --replSet rs0 --bind_ip localhost
timeout /t 5 >nul
mongosh --port 27017
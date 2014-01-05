#!/bin/bash       
sass --watch client/styles/style.scss:client/styles/output.css &
 mrt  --port 5000 &

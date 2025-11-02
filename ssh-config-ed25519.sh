#!/bin/bash
# SSH connection with ed25519 algorithm support

SERVER="5.129.248.224"
USER="root"
PASS="xQvB1pv?yZTjaR"

expect << EOF
set timeout 300
spawn ssh -o StrictHostKeyChecking=no \
         -o HostKeyAlgorithms=+ssh-ed25519 \
         -o PubkeyAcceptedKeyTypes=+ssh-ed25519 \
         -o KexAlgorithms=+curve25519-sha256 \
         ${USER}@${SERVER}
expect {
    "password:" {
        send "${PASS}\r"
        exp_continue
    }
    "root@" {
        send "echo '✅ Connected with ed25519' && uname -a\r"
        expect "root@"
        send "exit\r"
        expect eof
    }
    timeout {
        puts "Connection timeout"
        exit 1
    }
}
EOF

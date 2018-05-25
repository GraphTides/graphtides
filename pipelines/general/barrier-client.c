#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <arpa/inet.h>
#include <sys/socket.h>

int main(int argc, char* argv[]) {
    if (argc < 4) {
        printf("Usage: %s HOSTNAME PORT TOKEN\n", argv[0]);
        return 1;
    }

    const char* server_name = argv[1];
    const int server_port = atoi(argv[2]);

    struct sockaddr_in server_address;
    memset(&server_address, 0, sizeof(server_address));
    server_address.sin_family = AF_INET;

    // creates binary representation of server name
    // and stores it as sin_addr
    // http://beej.us/guide/bgnet/output/html/multipage/inet_ntopman.html
    inet_pton(AF_INET, server_name, &server_address.sin_addr);

    // htons: port in network order format
    server_address.sin_port = htons(server_port);

    // open a stream socket
    int sock;
    if ((sock = socket(PF_INET, SOCK_STREAM, 0)) < 0) {
        printf("could not create socket\n");
        return 1;
    }

    // TCP is connection oriented, a reliable connection
    // **must** be established before any data is exchanged
    if (connect(sock, (struct sockaddr*)&server_address, sizeof(server_address)) < 0) {
        printf("could not connect to server\n");
        return 1;
    }

    // data that will be sent to the server
    const char* data_to_send = argv[3];
    send(sock, data_to_send, strlen(data_to_send), 0);

    // receive
    int n = 0;
    int len = 0, maxlen = 100;
    char buffer[maxlen];
    char* pbuffer = buffer;

    // will remain open until the server terminates the connection
    while ((n = recv(sock, pbuffer, maxlen, 0)) > 0) {
        pbuffer += n;
        maxlen -= n;
        len += n;

        buffer[len] = '\0';
        printf("received: %s", buffer);
    }

    // close the socket
    close(sock);

    // only return 0 if successful
    if (len > 0) {
        return 0;
    }
    return 1;
}

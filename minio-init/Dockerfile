FROM alpine:latest

RUN apk add --no-cache bash curl && \
    ARCH=$(uname -m) && \
    case "$ARCH" in \
      aarch64) MC_ARCH="linux-arm64" ;; \
      *) MC_ARCH="linux-amd64" ;; \
    esac && \
    curl -fsSL "https://dl.min.io/client/mc/release/${MC_ARCH}/mc" -o /usr/local/bin/mc && \
    chmod +x /usr/local/bin/mc

COPY init.sh /init.sh
RUN chmod +x /init.sh

ENTRYPOINT ["/bin/sh", "/init.sh"]

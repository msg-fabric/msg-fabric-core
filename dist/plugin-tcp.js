'use strict';

var net = require('net');

function bindStreamChannel(stream, api_channel, props) {
  const channel = api_channel.bindChannel(sendPktRaw, props);
  connectPacketStream(stream, channel, true);
  return channel;

  function sendPktRaw(pkt) {
    if (!Buffer.isBuffer(pkt)) {
      if (pkt._raw_) {
        pkt = Buffer.from(pkt._raw_);
      } else if (pkt.byteLength) {
        pkt = Buffer.from(pkt);
      } else {
        throw new TypeError(`sendPktRaw expected 'pkt' as a Buffer or an object with a '_raw_' Buffer`);
      }
    }

    if (null === pkt) {
      return void stream.end();
    }
    return void stream.write(pkt);
  }
}

function connectPacketStream(stream, channel, endStreamOnShutdown) {
  const shutdown = new Promise(lifecycle);
  return Object.defineProperty(channel, 'shutdown', { value: shutdown });

  function lifecycle(resolve, reject) {
    let pktDispatch = channel.bindDispatchPackets();

    stream.on('error', shutdown);
    stream.on('close', shutdown);
    stream.on('data', function (data) {
      try {
        pktDispatch(data);
      } catch (err) {
        return shutdown(err);
      }
    });

    function shutdown(err) {
      if (undefined === pktDispatch) {
        return;
      }
      pktDispatch = undefined;
      if (endStreamOnShutdown) {
        stream.end();
      }

      err ? reject(err) : resolve();
    }
  }
}

net_common.net_common = net_common;
function net_common(hub, asURL) {
  // shared implementation between net/tcp and tls implementations
  return {
    init_server(svr) {
      svr.conn_info = function () {
        const { address, port } = svr.address();
        return { ip_server: { address, port, asURL } };
      };
      return svr;
    },

    bindOnPeer(svr, onPeer) {
      if ('function' === typeof onPeer) {
        return onPeer;
      }
      if ('string' === typeof onPeer) {
        return channel => svr.emit(onPeer, channel);
      }
      return () => null;
    },

    bindChannel(sock) {
      const channel = bindSocketChannel(sock, hub._api_channel, asURL);

      channel.sendRoutingHandshake();
      return channel;
    },

    unpackConnectArgs(args) {
      if (1 === args.length) {
        if ('string' === typeof args[0].href) {
          const { hostname: host, port } = args[0];
          args[0] = { host, port };
        }
      }
      return args;
    } };
}

net_common.bindSocketChannel = bindSocketChannel;
function bindSocketChannel(sock, api_channel, asURL) {
  sock.setNoDelay(true);

  const conn_info = () => ({
    ip_remote: { asURL, address: sock.remoteAddress, port: sock.remotePort },
    ip_local: { asURL, address: sock.localAddress, port: sock.localPort } });

  return bindStreamChannel(sock, api_channel, { conn_info: { value: conn_info } });
}

tcp_plugin.tcp_plugin = tcp_plugin;
function tcp_plugin(plugin_options = {}) {
  function as_tcp_url() {
    return `tcp://${this.address}:${this.port}`;
  }

  return function (hub) {
    const _common_ = net_common(hub, as_tcp_url);

    hub.registerConnectionProtocol('tcp:', connect);
    return hub.tcp = { connect, createServer: createServer$$1 };

    function connect(...args) {
      args = _common_.unpackConnectArgs(args);
      return new Promise((resolve, reject) => {
        net.createConnection(...args, function () {
          const sock = this.unref().setKeepAlive(true);
          const channel = _common_.bindChannel(sock);
          resolve(channel);
        }).on('error', reject);
      });
    }

    function createServer$$1(onPeer) {
      const svr = net.createServer(function (sock) {
        sock = sock.unref().setKeepAlive(false);
        const channel = _common_.bindChannel(sock);
        on_peer(channel);
      });
      const on_peer = _common_.bindOnPeer(svr, onPeer);
      return _common_.init_server(svr);
    }
  };
}

module.exports = tcp_plugin;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGx1Z2luLXRjcC5qcyIsInNvdXJjZXMiOlsiLi4vY29kZS9wbHVnaW5zL25ldC9fc3RyZWFtX2NvbW1vbi5qc3kiLCIuLi9jb2RlL3BsdWdpbnMvbmV0L19uZXRfY29tbW9uLmpzeSIsIi4uL2NvZGUvcGx1Z2lucy9uZXQvdGNwLmpzeSJdLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgZnVuY3Rpb24gYmluZFN0cmVhbUNoYW5uZWwoc3RyZWFtLCBhcGlfY2hhbm5lbCwgcHJvcHMpIDo6XG4gIGNvbnN0IGNoYW5uZWwgPSBhcGlfY2hhbm5lbC5iaW5kQ2hhbm5lbCBAIHNlbmRQa3RSYXcsIHByb3BzXG4gIGNvbm5lY3RQYWNrZXRTdHJlYW0gQCBzdHJlYW0sIGNoYW5uZWwsIHRydWVcbiAgcmV0dXJuIGNoYW5uZWxcblxuICBmdW5jdGlvbiBzZW5kUGt0UmF3KHBrdCkgOjpcbiAgICBpZiAhIEJ1ZmZlci5pc0J1ZmZlciBAIHBrdCA6OlxuICAgICAgaWYgcGt0Ll9yYXdfIDo6XG4gICAgICAgIHBrdCA9IEJ1ZmZlci5mcm9tIEAgcGt0Ll9yYXdfXG4gICAgICBlbHNlIGlmIHBrdC5ieXRlTGVuZ3RoIDo6XG4gICAgICAgIHBrdCA9IEJ1ZmZlci5mcm9tIEAgcGt0XG4gICAgICBlbHNlIDo6XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IgQCBgc2VuZFBrdFJhdyBleHBlY3RlZCAncGt0JyBhcyBhIEJ1ZmZlciBvciBhbiBvYmplY3Qgd2l0aCBhICdfcmF3XycgQnVmZmVyYFxuXG4gICAgaWYgbnVsbCA9PT0gcGt0IDo6XG4gICAgICByZXR1cm4gdm9pZCBzdHJlYW0uZW5kKClcbiAgICByZXR1cm4gdm9pZCBzdHJlYW0ud3JpdGUocGt0KVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBjb25uZWN0UGFja2V0U3RyZWFtKHN0cmVhbSwgY2hhbm5lbCwgZW5kU3RyZWFtT25TaHV0ZG93bikgOjpcbiAgY29uc3Qgc2h1dGRvd24gPSBuZXcgUHJvbWlzZSBAIGxpZmVjeWNsZVxuICByZXR1cm4gT2JqZWN0LmRlZmluZVByb3BlcnR5IEAgY2hhbm5lbCwgJ3NodXRkb3duJywgQDogdmFsdWU6IHNodXRkb3duXG4gIFxuICBmdW5jdGlvbiBsaWZlY3ljbGUocmVzb2x2ZSwgcmVqZWN0KSA6OlxuICAgIGxldCBwa3REaXNwYXRjaCA9IGNoYW5uZWwuYmluZERpc3BhdGNoUGFja2V0cygpXG5cbiAgICBzdHJlYW0ub24gQCAnZXJyb3InLCBzaHV0ZG93blxuICAgIHN0cmVhbS5vbiBAICdjbG9zZScsIHNodXRkb3duXG4gICAgc3RyZWFtLm9uIEAgJ2RhdGEnLCBmdW5jdGlvbiAoZGF0YSkgOjpcbiAgICAgIHRyeSA6OiBwa3REaXNwYXRjaChkYXRhKVxuICAgICAgY2F0Y2ggZXJyIDo6XG4gICAgICAgIHJldHVybiBzaHV0ZG93bihlcnIpXG5cbiAgICBmdW5jdGlvbiBzaHV0ZG93bihlcnIpIDo6XG4gICAgICBpZiB1bmRlZmluZWQgPT09IHBrdERpc3BhdGNoIDo6IHJldHVyblxuICAgICAgcGt0RGlzcGF0Y2ggPSB1bmRlZmluZWRcbiAgICAgIGlmIGVuZFN0cmVhbU9uU2h1dGRvd24gOjpcbiAgICAgICAgc3RyZWFtLmVuZCgpXG5cbiAgICAgIGVyciA/IHJlamVjdChlcnIpIDogcmVzb2x2ZSgpXG5cbiIsImltcG9ydCB7YmluZFN0cmVhbUNoYW5uZWx9IGZyb20gJy4vX3N0cmVhbV9jb21tb24uanN5J1xuXG5uZXRfY29tbW9uLm5ldF9jb21tb24gPSBuZXRfY29tbW9uXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBuZXRfY29tbW9uKGh1YiwgYXNVUkwpIDo6XG4gIC8vIHNoYXJlZCBpbXBsZW1lbnRhdGlvbiBiZXR3ZWVuIG5ldC90Y3AgYW5kIHRscyBpbXBsZW1lbnRhdGlvbnNcbiAgcmV0dXJuIEA6XG4gICAgaW5pdF9zZXJ2ZXIoc3ZyKSA6OlxuICAgICAgc3ZyLmNvbm5faW5mbyA9IGZ1bmN0aW9uICgpIDo6XG4gICAgICAgIGNvbnN0IHthZGRyZXNzLCBwb3J0fSA9IHN2ci5hZGRyZXNzKClcbiAgICAgICAgcmV0dXJuIEB7fSBpcF9zZXJ2ZXI6IEB7fSBhZGRyZXNzLCBwb3J0LCBhc1VSTFxuICAgICAgcmV0dXJuIHN2clxuXG4gICAgYmluZE9uUGVlcihzdnIsIG9uUGVlcikgOjpcbiAgICAgIGlmICdmdW5jdGlvbicgPT09IHR5cGVvZiBvblBlZXIgOjpcbiAgICAgICAgcmV0dXJuIG9uUGVlclxuICAgICAgaWYgJ3N0cmluZycgPT09IHR5cGVvZiBvblBlZXIgOjpcbiAgICAgICAgcmV0dXJuIGNoYW5uZWwgPT4gc3ZyLmVtaXQgQCBvblBlZXIsIGNoYW5uZWxcbiAgICAgIHJldHVybiAoKSA9PiBudWxsXG5cbiAgICBiaW5kQ2hhbm5lbChzb2NrKSA6OlxuICAgICAgY29uc3QgY2hhbm5lbCA9IGJpbmRTb2NrZXRDaGFubmVsIEBcbiAgICAgICAgc29jaywgaHViLl9hcGlfY2hhbm5lbCwgYXNVUkxcblxuICAgICAgY2hhbm5lbC5zZW5kUm91dGluZ0hhbmRzaGFrZSgpXG4gICAgICByZXR1cm4gY2hhbm5lbFxuXG4gICAgdW5wYWNrQ29ubmVjdEFyZ3MoYXJncykgOjpcbiAgICAgIGlmIDEgPT09IGFyZ3MubGVuZ3RoIDo6XG4gICAgICAgIGlmICdzdHJpbmcnID09PSB0eXBlb2YgYXJnc1swXS5ocmVmIDo6XG4gICAgICAgICAgY29uc3Qge2hvc3RuYW1lOmhvc3QsIHBvcnR9ID0gYXJnc1swXVxuICAgICAgICAgIGFyZ3NbMF0gPSBAe30gaG9zdCwgcG9ydFxuICAgICAgcmV0dXJuIGFyZ3NcblxuXG5uZXRfY29tbW9uLmJpbmRTb2NrZXRDaGFubmVsID0gYmluZFNvY2tldENoYW5uZWxcbmZ1bmN0aW9uIGJpbmRTb2NrZXRDaGFubmVsKHNvY2ssIGFwaV9jaGFubmVsLCBhc1VSTCkgOjpcbiAgc29jay5zZXROb0RlbGF5KHRydWUpXG5cbiAgY29uc3QgY29ubl9pbmZvID0gKCkgPT4gQDpcbiAgICBpcF9yZW1vdGU6IEB7fSBhc1VSTCwgYWRkcmVzczogc29jay5yZW1vdGVBZGRyZXNzLCBwb3J0OiBzb2NrLnJlbW90ZVBvcnRcbiAgICBpcF9sb2NhbDogQHt9IGFzVVJMLCBhZGRyZXNzOiBzb2NrLmxvY2FsQWRkcmVzcywgcG9ydDogc29jay5sb2NhbFBvcnRcblxuICByZXR1cm4gYmluZFN0cmVhbUNoYW5uZWwgQCBzb2NrLCBhcGlfY2hhbm5lbFxuICAgIEA6IGNvbm5faW5mbzogQDogdmFsdWU6IGNvbm5faW5mb1xuXG4iLCJpbXBvcnQgeyBjcmVhdGVTZXJ2ZXIgYXMgX3RjcF9jcmVhdGVTZXJ2ZXIsIGNyZWF0ZUNvbm5lY3Rpb24gYXMgX3RjcF9jcmVhdGVDb25uZWN0aW9uIH0gZnJvbSAnbmV0J1xuaW1wb3J0IG5ldF9jb21tb24gZnJvbSAnLi9fbmV0X2NvbW1vbi5qc3knXG5cbnRjcF9wbHVnaW4udGNwX3BsdWdpbiA9IHRjcF9wbHVnaW5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHRjcF9wbHVnaW4ocGx1Z2luX29wdGlvbnM9e30pIDo6XG4gIGZ1bmN0aW9uIGFzX3RjcF91cmwoKSA6OiByZXR1cm4gYHRjcDovLyR7dGhpcy5hZGRyZXNzfToke3RoaXMucG9ydH1gXG5cbiAgcmV0dXJuIGZ1bmN0aW9uKGh1YikgOjpcbiAgICBjb25zdCBfY29tbW9uXyA9IG5ldF9jb21tb24oaHViLCBhc190Y3BfdXJsKVxuXG4gICAgaHViLnJlZ2lzdGVyQ29ubmVjdGlvblByb3RvY29sIEAgJ3RjcDonLCBjb25uZWN0XG4gICAgcmV0dXJuIGh1Yi50Y3AgPSBAOiBjb25uZWN0LCBjcmVhdGVTZXJ2ZXJcblxuXG4gICAgZnVuY3Rpb24gY29ubmVjdCguLi5hcmdzKSA6OlxuICAgICAgYXJncyA9IF9jb21tb25fLnVucGFja0Nvbm5lY3RBcmdzKGFyZ3MpXG4gICAgICByZXR1cm4gbmV3IFByb21pc2UgQCAocmVzb2x2ZSwgcmVqZWN0KSA9PiA6OlxuICAgICAgICBfdGNwX2NyZWF0ZUNvbm5lY3Rpb24gQCAuLi5hcmdzLCBmdW5jdGlvbigpIDo6XG4gICAgICAgICAgY29uc3Qgc29jayA9IHRoaXMudW5yZWYoKS5zZXRLZWVwQWxpdmUodHJ1ZSlcbiAgICAgICAgICBjb25zdCBjaGFubmVsID0gX2NvbW1vbl8uYmluZENoYW5uZWwoc29jaylcbiAgICAgICAgICByZXNvbHZlKGNoYW5uZWwpXG4gICAgICAgIC5vbiBAICdlcnJvcicsIHJlamVjdFxuXG4gICAgZnVuY3Rpb24gY3JlYXRlU2VydmVyKG9uUGVlcikgOjpcbiAgICAgIGNvbnN0IHN2ciA9IF90Y3BfY3JlYXRlU2VydmVyIEAgZnVuY3Rpb24gKHNvY2spIDo6XG4gICAgICAgIHNvY2sgPSBzb2NrLnVucmVmKCkuc2V0S2VlcEFsaXZlKGZhbHNlKVxuICAgICAgICBjb25zdCBjaGFubmVsID0gX2NvbW1vbl8uYmluZENoYW5uZWwoc29jaylcbiAgICAgICAgb25fcGVlcihjaGFubmVsKVxuICAgICAgY29uc3Qgb25fcGVlciA9IF9jb21tb25fLmJpbmRPblBlZXIoc3ZyLCBvblBlZXIpXG4gICAgICByZXR1cm4gX2NvbW1vbl8uaW5pdF9zZXJ2ZXIoc3ZyKVxuXG4iXSwibmFtZXMiOlsiYmluZFN0cmVhbUNoYW5uZWwiLCJzdHJlYW0iLCJhcGlfY2hhbm5lbCIsInByb3BzIiwiY2hhbm5lbCIsImJpbmRDaGFubmVsIiwic2VuZFBrdFJhdyIsInBrdCIsIkJ1ZmZlciIsImlzQnVmZmVyIiwiX3Jhd18iLCJmcm9tIiwiYnl0ZUxlbmd0aCIsIlR5cGVFcnJvciIsImVuZCIsIndyaXRlIiwiY29ubmVjdFBhY2tldFN0cmVhbSIsImVuZFN0cmVhbU9uU2h1dGRvd24iLCJzaHV0ZG93biIsIlByb21pc2UiLCJsaWZlY3ljbGUiLCJPYmplY3QiLCJkZWZpbmVQcm9wZXJ0eSIsInZhbHVlIiwicmVzb2x2ZSIsInJlamVjdCIsInBrdERpc3BhdGNoIiwiYmluZERpc3BhdGNoUGFja2V0cyIsIm9uIiwiZGF0YSIsImVyciIsInVuZGVmaW5lZCIsIm5ldF9jb21tb24iLCJodWIiLCJhc1VSTCIsInN2ciIsImNvbm5faW5mbyIsImFkZHJlc3MiLCJwb3J0IiwiaXBfc2VydmVyIiwib25QZWVyIiwiZW1pdCIsInNvY2siLCJiaW5kU29ja2V0Q2hhbm5lbCIsIl9hcGlfY2hhbm5lbCIsInNlbmRSb3V0aW5nSGFuZHNoYWtlIiwiYXJncyIsImxlbmd0aCIsImhyZWYiLCJob3N0bmFtZSIsImhvc3QiLCJzZXROb0RlbGF5IiwicmVtb3RlQWRkcmVzcyIsInJlbW90ZVBvcnQiLCJsb2NhbEFkZHJlc3MiLCJsb2NhbFBvcnQiLCJ0Y3BfcGx1Z2luIiwicGx1Z2luX29wdGlvbnMiLCJhc190Y3BfdXJsIiwiX2NvbW1vbl8iLCJyZWdpc3RlckNvbm5lY3Rpb25Qcm90b2NvbCIsImNvbm5lY3QiLCJ0Y3AiLCJjcmVhdGVTZXJ2ZXIiLCJ1bnBhY2tDb25uZWN0QXJncyIsInVucmVmIiwic2V0S2VlcEFsaXZlIiwiX3RjcF9jcmVhdGVTZXJ2ZXIiLCJvbl9wZWVyIiwiYmluZE9uUGVlciIsImluaXRfc2VydmVyIl0sIm1hcHBpbmdzIjoiOzs7O0FBQU8sU0FBU0EsaUJBQVQsQ0FBMkJDLE1BQTNCLEVBQW1DQyxXQUFuQyxFQUFnREMsS0FBaEQsRUFBdUQ7UUFDdERDLFVBQVVGLFlBQVlHLFdBQVosQ0FBMEJDLFVBQTFCLEVBQXNDSCxLQUF0QyxDQUFoQjtzQkFDc0JGLE1BQXRCLEVBQThCRyxPQUE5QixFQUF1QyxJQUF2QztTQUNPQSxPQUFQOztXQUVTRSxVQUFULENBQW9CQyxHQUFwQixFQUF5QjtRQUNwQixDQUFFQyxPQUFPQyxRQUFQLENBQWtCRixHQUFsQixDQUFMLEVBQTZCO1VBQ3hCQSxJQUFJRyxLQUFQLEVBQWU7Y0FDUEYsT0FBT0csSUFBUCxDQUFjSixJQUFJRyxLQUFsQixDQUFOO09BREYsTUFFSyxJQUFHSCxJQUFJSyxVQUFQLEVBQW9CO2NBQ2pCSixPQUFPRyxJQUFQLENBQWNKLEdBQWQsQ0FBTjtPQURHLE1BRUE7Y0FDRyxJQUFJTSxTQUFKLENBQWlCLDBFQUFqQixDQUFOOzs7O1FBRUQsU0FB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

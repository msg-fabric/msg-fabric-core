import { createDataViewPacketParser } from 'msg-fabric-packet-stream';

function browser_router_plugin(plugin_options = {}) {
  return { subclass(MessageHub_PI, bases) {
      Object.assign(MessageHub_PI.prototype, {
        _init_packetParser() {
          return createDataViewPacketParser(plugin_options);
        },

        _init_router() {
          const id_self = random_id_self();
          const router = new bases.MessageRouter(id_self);
          router.allowUnverifiedRoutes = true;
          return router;
        } });
    } };
}

function random_id_self() {
  const ua = new Int32Array(1),
        dv = new DataView(ua.buffer);
  if ('undefined' !== typeof window) {
    window.crypto.getRandomValues(ua);
  } else {
    ua[0] = 0xffffffff * Math.random();
  }
  return dv.getUint32(0, true);
}

export default browser_router_plugin;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGx1Z2luLXJvdXRlci1icm93c2VyLm1qcyIsInNvdXJjZXMiOlsiLi4vY29kZS9wbHVnaW5zL3JvdXRlci9icm93c2VyLmpzeSJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge2NyZWF0ZURhdGFWaWV3UGFja2V0UGFyc2VyIGFzIGNyZWF0ZVBhY2tldFBhcnNlcn0gZnJvbSAnbXNnLWZhYnJpYy1wYWNrZXQtc3RyZWFtJ1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBicm93c2VyX3JvdXRlcl9wbHVnaW4ocGx1Z2luX29wdGlvbnM9e30pIDo6XG4gIHJldHVybiBAOiBzdWJjbGFzcyhNZXNzYWdlSHViX1BJLCBiYXNlcykgOjpcbiAgICBPYmplY3QuYXNzaWduIEAgTWVzc2FnZUh1Yl9QSS5wcm90b3R5cGUsIEA6XG4gICAgICBfaW5pdF9wYWNrZXRQYXJzZXIoKSA6OlxuICAgICAgICByZXR1cm4gY3JlYXRlUGFja2V0UGFyc2VyIEAgcGx1Z2luX29wdGlvbnNcblxuICAgICAgX2luaXRfcm91dGVyKCkgOjpcbiAgICAgICAgY29uc3QgaWRfc2VsZiA9IHJhbmRvbV9pZF9zZWxmKClcbiAgICAgICAgY29uc3Qgcm91dGVyID0gbmV3IGJhc2VzLk1lc3NhZ2VSb3V0ZXIoaWRfc2VsZilcbiAgICAgICAgcm91dGVyLmFsbG93VW52ZXJpZmllZFJvdXRlcyA9IHRydWVcbiAgICAgICAgcmV0dXJuIHJvdXRlclxuXG5mdW5jdGlvbiByYW5kb21faWRfc2VsZigpIDo6XG4gIGNvbnN0IHVhID0gbmV3IEludDMyQXJyYXkoMSksIGR2ID0gbmV3IERhdGFWaWV3KHVhLmJ1ZmZlcilcbiAgaWYgJ3VuZGVmaW5lZCcgIT09IHR5cGVvZiB3aW5kb3cgOjpcbiAgICB3aW5kb3cuY3J5cHRvLmdldFJhbmRvbVZhbHVlcyh1YSlcbiAgZWxzZSA6OlxuICAgIHVhWzBdID0gMHhmZmZmZmZmZiAqIE1hdGgucmFuZG9tKClcbiAgcmV0dXJuIGR2LmdldFVpbnQzMigwLCB0cnVlKVxuIl0sIm5hbWVzIjpbImJyb3dzZXJfcm91dGVyX3BsdWdpbiIsInBsdWdpbl9vcHRpb25zIiwic3ViY2xhc3MiLCJNZXNzYWdlSHViX1BJIiwiYmFzZXMiLCJhc3NpZ24iLCJwcm90b3R5cGUiLCJjcmVhdGVQYWNrZXRQYXJzZXIiLCJpZF9zZWxmIiwicmFuZG9tX2lkX3NlbGYiLCJyb3V0ZXIiLCJNZXNzYWdlUm91dGVyIiwiYWxsb3dVbnZlcmlmaWVkUm91dGVzIiwidWEiLCJJbnQzMkFycmF5IiwiZHYiLCJEYXRhVmlldyIsImJ1ZmZlciIsIndpbmRvdyIsImNyeXB0byIsImdldFJhbmRvbVZhbHVlcyIsIk1hdGgiLCJyYW5kb20iLCJnZXRVaW50MzIiXSwibWFwcGluZ3MiOiI7O0FBRWUsU0FBU0EscUJBQVQsQ0FBK0JDLGlCQUFlLEVBQTlDLEVBQWtEO1NBQ3RELEVBQUNDLFNBQVNDLGFBQVQsRUFBd0JDLEtBQXhCLEVBQStCO2FBQ2hDQyxNQUFQLENBQWdCRixjQUFjRyxTQUE5QixFQUEyQzs2QkFDcEI7aUJBQ1pDLDJCQUFxQk4sY0FBckIsQ0FBUDtTQUZ1Qzs7dUJBSTFCO2dCQUNQTyxVQUFVQyxnQkFBaEI7Z0JBQ01DLFNBQVMsSUFBSU4sTUFBTU8sYUFBVixDQUF3QkgsT0FBeEIsQ0FBZjtpQkFDT0kscUJBQVAsR0FBK0IsSUFBL0I7aUJBQ09GLE1BQVA7U0FSdUMsRUFBM0M7S0FETyxFQUFUOzs7QUFXRixTQUFTRCxjQUFULEdBQTBCO1FBQ2xCSSxLQUFLLElBQUlDLFVBQUosQ0FBZSxDQUFmLENBQVg7UUFBOEJDLEtBQUssSUFBSUMsUUFBSixDQUFhSCxHQUFHSSxNQUFoQixDQUFuQztNQUNHLGdCQUFnQixPQUFPQyxNQUExQixFQUFtQztXQUMxQkMsTUFBUCxDQUFjQyxlQUFkLENBQThCUCxFQUE5QjtHQURGLE1BRUs7T0FDQSxDQUFILElBQVEsYUFBYVEsS0FBS0MsTUFBTCxFQUFyQjs7U0FDS1AsR0FBR1EsU0FBSCxDQUFhLENBQWIsRUFBZ0IsSUFBaEIsQ0FBUDs7Ozs7In0=
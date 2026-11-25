/** Lifetime of a single mounted animation engine. */
export function createRuntime() {
  const controller = new AbortController();
  const frames = new Set(), timers = new Set(), observers = new Set();
  let disposed = false;
  return {
    listen(target, type, listener, options = {}) {
      target.addEventListener(type, listener, { ...options, signal: controller.signal });
    },
    frame(callback) {
      if (disposed) return 0;
      const id = requestAnimationFrame(time => { frames.delete(id); if (!disposed) callback(time); });
      frames.add(id); return id;
    },
    cancelFrame(id) { cancelAnimationFrame(id); frames.delete(id); },
    timeout(callback, delay) {
      if (disposed) return 0;
      const id = setTimeout(() => { timers.delete(id); if (!disposed) callback(); }, delay);
      timers.add(id); return id;
    },
    cancelTimeout(id) { clearTimeout(id); timers.delete(id); },
    observer(Observer, callback) { const observer = new Observer(callback); observers.add(observer); return observer; },
    dispose() { disposed = true; controller.abort(); for (const id of frames) cancelAnimationFrame(id); for (const id of timers) clearTimeout(id); for (const observer of observers) observer.disconnect(); frames.clear(); timers.clear(); observers.clear(); },
  };
}

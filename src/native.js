/* Android and iPhone features, bundled into www/native.js. Does nothing in a normal browser. */
import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { App } from '@capacitor/app';

const base64 = blob => new Promise((ok, no) => { const r = new FileReader(); r.onload = () => ok(r.result.split(',')[1]); r.onerror = no; r.readAsDataURL(blob); });
let queue = Promise.resolve();

window.Native = {
  isNative: Capacitor.isNativePlatform(),
  get: async key => (await Preferences.get({ key })).value,
  set: (key, value) => Preferences.set({ key, value }),
  /* Replace all pending reminders. Resolves false if the user has not allowed notifications. */
  schedule(items) {
    const run = async () => {
      const { notifications } = await LocalNotifications.getPending();
      if (notifications.length) await LocalNotifications.cancel({ notifications });
      if (!items.length) return true;
      let p = await LocalNotifications.checkPermissions();
      if (p.display !== 'granted') p = await LocalNotifications.requestPermissions();
      if (p.display !== 'granted') return false;
      await LocalNotifications.schedule({ notifications: items.map(i => ({ id: i.id, title: i.title, body: i.body, schedule: { at: i.at } })) });
      return true;
    };
    return queue = queue.then(run, run);
  },
  async shareFile(filename, blob, title) {
    const { uri } = await Filesystem.writeFile({ path: filename, data: await base64(blob), directory: Directory.Cache });
    await Share.share({ title, files: [uri] });
  },
  onBack(close, flush) {
    App.addListener('backButton', () => { if (!close()) App.exitApp(); });
    App.addListener('pause', flush);
  }
};

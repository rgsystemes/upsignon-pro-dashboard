export function copyToClipboard(value, callback) {
  navigator.permissions.query({ name: 'clipboard-write' }).then((result) => {
    if (result.state === 'granted' || result.state === 'prompt') {
      navigator.clipboard.writeText(value);
      if (callback) callback();
    }
  });
}

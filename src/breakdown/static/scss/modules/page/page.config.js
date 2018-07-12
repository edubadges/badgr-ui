module.exports = {
  preview: '@preview--none',
  status: 'wip',
  variants: [
    {
      label: 'Default',
      preview: '@preview--none',
    },
    {
      label: 'Default (Example)',
      preview: '@preview',
      view: 'page--example.hbs',
    },
  ].map(obj => {
    obj['name'] = obj.label.replace(/[\s+()]/g, '').toLowerCase();
    return obj;
  })
};
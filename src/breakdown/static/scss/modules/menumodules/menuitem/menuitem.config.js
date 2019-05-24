module.exports = {
  label: 'Menu Item',
  preview: '@preview--none',
  variants: [
    {
      label: 'Default (Example)',
      name: 'defaultexample',
      preview: '@preview',
      view: 'menuitem--example.hbs'
    },
    {
      context: {
        menuItemContext: {
          modifier: 'menuitem-is-active'
        }
      },
      label: 'Is Active (Example)',
      name: 'isactiveexample',
      preview: '@preview',
      view: 'menuitem--example.hbs'
    },
    {
      context: {
        menuItemContext: {
          modifier: 'menuitem-secondary'
        }
      },
      label: 'Secondary (Example)',
      name: 'secondaryexample',
      preview: '@preview',
      view: 'menuitem--example.hbs'
    },
    {
      context: {
        menuItemContext: {
          modifier: 'menuitem-secondary menuitem-is-active'
        }
      },
      label: 'Secondary + Is Active (Example)',
      name: 'secondaryisactiveexample',
      preview: '@preview',
      view: 'menuitem--example.hbs'
    },
    {
      context: {
        menuItems: [
          {
            context: {
              modifier: 'menuitem-secondary'
            },
            text: 'Profile'
          },

          {
            context: {
              modifier: 'menuitem-secondary'
            },
            text: 'Sign Out'
          }
        ]
      },
      label: 'Dropdown (Example)',
      name: 'dropdownexample',
      preview: '@preview',
      view: 'menuitem--exampledropdown.hbs'
    },
    {
      context: {
        menuItemContext: {
          modifier: 'menuitem-is-active'
        },
        menuItems: [
          {
            context: {
              modifier: 'menuitem-secondary'
            },
            text: 'Profile'
          },
          {
            context: {
              modifier: 'menuitem-secondary'
            },
            text: 'App Integrations'
          },
          {
            context: {
              modifier: 'menuitem-secondary'
            },
            text: 'Sign Out'
          }
        ]
      },
      label: 'Dropdown + Is Active (Example)',
      name: 'dropdownisactiveexample',
      preview: '@preview',
      view: 'menuitem--exampledropdown.hbs'
    },
    {
      context: {
        menuItemContext: {
          modifier: 'menuitem-is-open'
        },
        menuItems: [
          {
            context: {
              modifier: 'menuitem-secondary'
            },
            text: 'Profile'
          },

          {
            context: {
              modifier: 'menuitem-secondary'
            },
            text: 'Sign Out'
          }
        ]
      },
      label: 'Dropdown + Is Open (Example)',
      name: 'dropdownisopenexample',
      preview: '@preview',
      view: 'menuitem--exampledropdown.hbs'
    }
  ]
};

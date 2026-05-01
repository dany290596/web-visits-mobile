import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';

const Blanc = definePreset(Aura, {
    semantic: {
        colorScheme: {
            light: {
                primary: {
                    color: '{blue.600}',        // Color de botón en tema claro
                    inverseColor: '#ffffff'
                },
                highLight: {
                    background: '#ffffffff',   // Fondo resaltado
                    color: '#000000'
                },
                highSecondary: {
                    background: '#f1f5f9',
                    color: '#ffffffff'
                },
                surface: {
                    0: '#ffffff',               // Fondo general claro
                    100: '{gray.100}'
                },
                text: {
                    color: '{gray.600}',
                    colorGray: '{gray.600}'
                },
                formField: {
                    background: '#ffffff',
                    filledBackground: '{surface.50}',
                    borderColor: '{surface.300}',
                    hoverBorderColor: '{primary.color}',
                    focusBorderColor: '{primary.color}',
                    placeholderColor: '{surface.500}',
                    color: '{surface.700}'
                },
                dialog: {
                    background: '#f9fafb',       // Fondo claro para diálogos
                    borderColor: '{gray.300}',   // Borde para diálogos
                    textColor: '{gray.900}'      // Texto en diálogos
                },
                datatable: {
                    bodyCellBg: '#ffffff',  // fondo blanco en modo claro
                    headerCellBg: '#ebebebff'
                },
            },
            dark: {
                primary: {
                    color: '{blue.600}',      // Color de botón en tema oscuro
                    inverseColor: '#ffffff'
                },
                highLight: {
                    background: '#11171D', // Fondo resaltado oscuro
                    color: '#ffffffff'
                },
                highSecondary: {
                    background: '#1e293b',
                    color: '#ffffffff'
                },
                surface: {
                    0: '#ffffff',               // Fondo general oscuro
                    100: '{gray.800}'
                },
                text: {
                    color: '#ffffff',
                    colorGray: '#ffffff'
                },
                formField: {
                    background: '#11171D',
                    filledBackground: '{surface.400}',
                    borderColor: '{surface.700}',
                    hoverBorderColor: '{primary.color}',
                    focusBorderColor: '{primary.color}',
                    placeholderColor: '{surface.400}',
                    color: '#ffffff'
                },
                dialog: {
                    background: '#11171D',       // Fondo oscuro para diálogos
                    borderColor: '{gray.600}',   // Borde para diálogos
                    textColor: '#11171D'      // Texto en diálogos
                },
                datatable: {
                    bodyCellBg: '#11171D',  // fondo blanco en modo claro
                    headerCellBg: '#11171D'
                }
            }
        }
    },
    components: {
        datatable: {
            css: ({ dt }) => `
        .p-datatable tbody td {
            background-color: ${dt('datatable.bodyCellBg')};
        }
        .p-datatable thead th {
            background-color: ${dt('datatable.headerCellBg')};
        }
      `,
            colorScheme: {
                light: {
                    bodyCell: {
                        selectedBorderColor: '{surface.50}'
                    },

                }
            }
        }
    },
    css: ({ dt }) => `
    :root {
      --highlight-bg: ${dt('highLight.background')};
      --highsecondary-bg: ${dt('highSecondary.background')};
      --textlight-bg: ${dt('text.color')};
      --textsecondary-bg: ${dt('text.colorGray')};
    }
  `
});

export default Blanc;
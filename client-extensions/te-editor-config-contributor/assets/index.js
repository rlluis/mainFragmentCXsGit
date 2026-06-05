/**
 * Editor Config Contributor Client Extension for Liferay
 * Registers a custom AI Content Assistant button in both CKEditor 4 and CKEditor 5.
 * Uses exact modular import paths from Liferay's CKEditor 5 import maps.
 */

import { Plugin } from '@ckeditor/ckeditor5-core/dist/index.js';
import { ButtonView } from '@ckeditor/ckeditor5-ui/dist/index.js';
import './ai-modal.js';

console.log("[TE-AIHUB-CONTRIBUTOR] Script parsed and executed successfully under ES Module mode.");
console.log("[TE-AIHUB-CONTRIBUTOR] Imported constructors:", { Plugin, ButtonView });

// 1. CKEditor 4 Plugin Registration (Fallback)
if (typeof CKEDITOR !== 'undefined') {
    console.log("[TE-AIHUB-CONTRIBUTOR] CKEDITOR 4 global detected. Adding 'te_aihub' plugin.");
    if (!CKEDITOR.plugins.get('te_aihub')) {
        CKEDITOR.plugins.add('te_aihub', {
            init: function(editor) {
                console.log("[TE-AIHUB-CONTRIBUTOR] CKEDITOR 4 plugin 'te_aihub' initialized for editor:", editor.name);
                // Add the trigger command
                editor.addCommand('openTEAIModal', {
                    exec: function(editor) {
                        console.log("[TE-AIHUB-CONTRIBUTOR] CKEDITOR 4 button clicked.");
                        
                        // Dynamically create and mount our native Custom Element Modal (no selectedText passed)
                        const modal = document.createElement('te-ai-prompt-modal');
                        
                        // Callback to receive generated AI text and insert it back into the editor
                        modal.onInsert = (generatedText) => {
                            if (generatedText) {
                                console.log("[TE-AIHUB-CONTRIBUTOR] Inserting text into CKEDITOR 4 editor.");
                                editor.insertHtml(generatedText);
                            }
                        };
                        
                        document.body.appendChild(modal);
                    }
                });

                // Add the Sparkle Button to the toolbar
                editor.ui.addButton('TEAIButton', {
                    label: 'AI Content Assistant',
                    command: 'openTEAIModal',
                    toolbar: 'insert,10',
                    icon: '/o/te-editor-config-contributor/icons/sparkle.svg'
                });
            }
        });
    }
}

// 2. Export the Editor Config Transformer (supporting both CKEditor 4 and CKEditor 5)
const editorConfigTransformer = (config) => {
    console.log("[TE-AIHUB-CONTRIBUTOR] editorConfigTransformer triggered. Incoming config:", config);

    if (!config) {
        console.log("[TE-AIHUB-CONTRIBUTOR] Warning: Config is empty or null.");
        return config;
    }

    // -------------------------------------------------------------
    // CKEDITOR 5 PATH
    // -------------------------------------------------------------
    if (config.editorType === 'ckeditor5') {
        console.log("[TE-AIHUB-CONTRIBUTOR] CKEditor 5 editorType detected.");

        if (Plugin && ButtonView) {
            console.log("[TE-AIHUB-CONTRIBUTOR] Modular CKEditor 5 Plugin and ButtonView successfully resolved! Defining TEAIHubPlugin.");

            class TEAIHubPlugin extends Plugin {
                init() {
                    const editor = this.editor;
                    console.log("[TE-AIHUB-CONTRIBUTOR] TEAIHubPlugin init called for CKEditor 5 editor instance.");

                    editor.ui.componentFactory.add('te_aihub_btn', () => {
                        console.log("[TE-AIHUB-CONTRIBUTOR] ComponentFactory building 'te_aihub_btn' button.");
                        const button = new ButtonView();

                        button.set({
                            label: 'AI Content Assistant',
                            icon: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L14.8 8.8L22 10L16.5 14.7L18.2 21.8L12 18L5.8 21.8L7.5 14.7L2 10L9.2 8.8L12 2Z" fill="#0b5fff"/></svg>',
                            tooltip: true,
                        });

                        button.on('execute', () => {
                            console.log("[TE-AIHUB-CONTRIBUTOR] CKEditor 5 button 'te_aihub_btn' executed.");

                            // Open our native prompt modal (no selectedText extracted/passed)
                            const modal = document.createElement('te-ai-prompt-modal');

                            modal.onInsert = (generatedText) => {
                                if (generatedText) {
                                    console.log("[TE-AIHUB-CONTRIBUTOR] Inserting text into CKEditor 5 editor model.");
                                    editor.model.change((writer) => {
                                        editor.model.insertContent(
                                            writer.createText(generatedText)
                                        );
                                    });
                                }
                            };

                            document.body.appendChild(modal);
                        });

                        return button;
                    });
                }
            }

            // Append our plugin to the extraPlugins list
            if (!config.extraPlugins) {
                config.extraPlugins = [];
            }
            if (Array.isArray(config.extraPlugins)) {
                console.log("[TE-AIHUB-CONTRIBUTOR] Registering TEAIHubPlugin in config.extraPlugins.");
                config.extraPlugins.push(TEAIHubPlugin);
            } else {
                console.log("[TE-AIHUB-CONTRIBUTOR] Error: config.extraPlugins is not an array, cannot append.");
            }

            // Append our button to the toolbar items list
            if (config.toolbar) {
                if (Array.isArray(config.toolbar)) {
                    console.log("[TE-AIHUB-CONTRIBUTOR] Appending 'te_aihub_btn' to toolbar array.");
                    config.toolbar.push('te_aihub_btn');
                } else if (config.toolbar.items && Array.isArray(config.toolbar.items)) {
                    console.log("[TE-AIHUB-CONTRIBUTOR] Appending 'te_aihub_btn' to toolbar.items array.");
                    config.toolbar.items.push('te_aihub_btn');
                } else {
                    console.log("[TE-AIHUB-CONTRIBUTOR] Warning: config.toolbar exists but could not find a standard items array. Replacing toolbar.");
                    config.toolbar = { items: ['te_aihub_btn'] };
                }
            } else {
                console.log("[TE-AIHUB-CONTRIBUTOR] Toolbar is undefined. Setting toolbar to contain our button.");
                config.toolbar = { items: ['te_aihub_btn'] };
            }
        } else {
            console.log("[TE-AIHUB-CONTRIBUTOR] Error: Plugin or ButtonView is missing. CKEditor 5 support cannot load.");
        }
        
        console.log("[TE-AIHUB-CONTRIBUTOR] Final transformed CKEditor 5 config:", config);
        return config;
    }

    // -------------------------------------------------------------
    // CKEDITOR 4 PATH (Fallback)
    // -------------------------------------------------------------
    console.log("[TE-AIHUB-CONTRIBUTOR] Processing CKEditor 4 path.");
    const extraPlugins = config.extraPlugins || '';
    config.extraPlugins = extraPlugins ? `${extraPlugins},te_aihub` : 'te_aihub';

    const toolbar = config.toolbar;
    if (typeof toolbar === 'string') {
        const activeToolbar = config[`toolbar_${toolbar}`];
        if (activeToolbar) {
            activeToolbar.push(['TEAIButton']);
        }
    } else if (Array.isArray(toolbar)) {
        let added = false;
        for (let i = 0; i < toolbar.length; i++) {
            if (Array.isArray(toolbar[i]) && toolbar[i].includes('Link')) {
                toolbar[i].push('TEAIButton');
                added = true;
                break;
            }
        }
        if (!added) {
            toolbar.push(['TEAIButton']);
        }
    }

    console.log("[TE-AIHUB-CONTRIBUTOR] Final transformed CKEditor 4 config:", config);
    return config;
};

const editorTransformer = {
    editorConfigTransformer,
};

export default editorTransformer;

/**
 * Editor Config Contributor Client Extension for Liferay
 * Registers a custom AI Social Syndicator button in both CKEditor 4 and CKEditor 5.
 * Uses exact modular import paths from Liferay's CKEditor 5 import maps.
 */

import { Plugin } from '@ckeditor/ckeditor5-core/dist/index.js';
import { ButtonView } from '@ckeditor/ckeditor5-ui/dist/index.js';
import './ai-modal.js';

console.log("[TE-SOCIAL-SYNDICATOR] Script parsed and executed successfully under ES Module mode.");
console.log("[TE-SOCIAL-SYNDICATOR] Imported constructors:", { Plugin, ButtonView });

// 1. CKEditor 4 Plugin Registration (Fallback)
if (typeof CKEDITOR !== 'undefined') {
    console.log("[TE-SOCIAL-SYNDICATOR] CKEDITOR 4 global detected. Adding 'te_social_syndicate' plugin.");
    if (!CKEDITOR.plugins.get('te_social_syndicate')) {
        CKEDITOR.plugins.add('te_social_syndicate', {
            init: function(editor) {
                console.log("[TE-SOCIAL-SYNDICATOR] CKEDITOR 4 plugin 'te_social_syndicate' initialized for editor:", editor.name);
                
                // Add the trigger command
                editor.addCommand('openTESocialModal', {
                    exec: function(editor) {
                        const editorText = editor.getData() || '';
                        console.log("[TE-SOCIAL-SYNDICATOR] CKEDITOR 4 button clicked. Editor content length:", editorText.length);
                        
                        // Dynamically create and mount our native Custom Element Modal (passing full editor text)
                        const modal = document.createElement('te-social-prompt-modal');
                        modal.editorText = editorText;
                        
                        document.body.appendChild(modal);
                    }
                });

                // Add the Social Syndication Button to the toolbar (uses a standard share/nodes network icon)
                editor.ui.addButton('TESocialButton', {
                    label: 'AI Social Media Syndicator',
                    command: 'openTESocialModal',
                    toolbar: 'insert,11',
                    icon: '/o/te-editor-social-syndicator/icons/share.svg'
                });
            }
        });
    }
}

// 2. Export the Editor Config Transformer (supporting both CKEditor 4 and CKEditor 5)
const editorConfigTransformer = (config) => {
    console.log("[TE-SOCIAL-SYNDICATOR] editorConfigTransformer triggered. Incoming config:", config);

    if (!config) {
        console.log("[TE-SOCIAL-SYNDICATOR] Warning: Config is empty or null.");
        return config;
    }

    // -------------------------------------------------------------
    // CKEDITOR 5 PATH
    // -------------------------------------------------------------
    if (config.editorType === 'ckeditor5') {
        console.log("[TE-SOCIAL-SYNDICATOR] CKEditor 5 editorType detected.");

        if (Plugin && ButtonView) {
            console.log("[TE-SOCIAL-SYNDICATOR] Modular CKEditor 5 Plugin and ButtonView successfully resolved! Defining TESocialSyndicatePlugin.");

            class TESocialSyndicatePlugin extends Plugin {
                init() {
                    const editor = this.editor;
                    console.log("[TE-SOCIAL-SYNDICATOR] TESocialSyndicatePlugin init called for CKEditor 5 editor instance.");

                    editor.ui.componentFactory.add('te_social_syndicate_btn', () => {
                        console.log("[TE-SOCIAL-SYNDICATOR] ComponentFactory building 'te_social_syndicate_btn' button.");
                        const button = new ButtonView();

                        button.set({
                            label: 'AI Social Media Syndicator',
                            icon: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18 16.08C17.24 16.08 16.56 16.38 16.04 16.85L8.91 12.7C8.96 12.47 9 12.24 9 12C9 11.76 8.96 11.53 8.91 11.3L15.96 7.19C16.5 7.69 17.21 8 18 8C19.66 8 21 6.66 21 5C21 3.34 19.66 2 18 2C16.34 2 15 3.34 15 5C15 5.24 15.04 5.47 15.09 5.7L8.04 9.81C7.5 9.31 6.79 9 6 9C4.34 9 3 10.34 3 12C3 13.66 4.34 15 6 15C6.79 15 7.5 14.69 8.04 14.19L15.16 18.35C15.11 18.56 15.08 18.78 15.08 19C15.08 20.61 16.39 21.91 18 21.91C19.61 21.91 20.92 20.61 20.92 19C20.92 17.39 19.61 16.08 18 16.08Z" fill="#3f51b5"/></svg>',
                            tooltip: true,
                        });

                        button.on('execute', () => {
                            console.log("[TE-SOCIAL-SYNDICATOR] CKEditor 5 button 'te_social_syndicate_btn' executed.");

                            // Get entire HTML written in CKEditor 5 using data processor
                            const editorText = editor.getData() || '';
                            console.log("[TE-SOCIAL-SYNDICATOR] Editor content length:", editorText.length);

                            // Open our native prompt modal (passing full editor text)
                            const modal = document.createElement('te-social-prompt-modal');
                            modal.editorText = editorText;

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
                console.log("[TE-SOCIAL-SYNDICATOR] Registering TESocialSyndicatePlugin in config.extraPlugins.");
                config.extraPlugins.push(TESocialSyndicatePlugin);
            } else {
                console.log("[TE-SOCIAL-SYNDICATOR] Error: config.extraPlugins is not an array, cannot append.");
            }

            // Append our button to the toolbar items list
            if (config.toolbar) {
                if (Array.isArray(config.toolbar)) {
                    console.log("[TE-SOCIAL-SYNDICATOR] Appending 'te_social_syndicate_btn' to toolbar array.");
                    config.toolbar.push('te_social_syndicate_btn');
                } else if (config.toolbar.items && Array.isArray(config.toolbar.items)) {
                    console.log("[TE-SOCIAL-SYNDICATOR] Appending 'te_social_syndicate_btn' to toolbar.items array.");
                    config.toolbar.items.push('te_social_syndicate_btn');
                } else {
                    console.log("[TE-SOCIAL-SYNDICATOR] Warning: config.toolbar exists but could not find a standard items array. Replacing toolbar.");
                    config.toolbar = { items: ['te_social_syndicate_btn'] };
                }
            } else {
                console.log("[TE-SOCIAL-SYNDICATOR] Toolbar is undefined. Setting toolbar to contain our button.");
                config.toolbar = { items: ['te_social_syndicate_btn'] };
            }
        } else {
            console.log("[TE-SOCIAL-SYNDICATOR] Error: Plugin or ButtonView is missing. CKEditor 5 support cannot load.");
        }
        
        console.log("[TE-SOCIAL-SYNDICATOR] Final transformed CKEditor 5 config:", config);
        return config;
    }

    // -------------------------------------------------------------
    // CKEDITOR 4 PATH (Fallback)
    // -------------------------------------------------------------
    console.log("[TE-SOCIAL-SYNDICATOR] Processing CKEditor 4 path.");
    const extraPlugins = config.extraPlugins || '';
    config.extraPlugins = extraPlugins ? `${extraPlugins},te_social_syndicate` : 'te_social_syndicate';

    const toolbar = config.toolbar;
    if (typeof toolbar === 'string') {
        const activeToolbar = config[`toolbar_${toolbar}`];
        if (activeToolbar) {
            activeToolbar.push(['TESocialButton']);
        }
    } else if (Array.isArray(toolbar)) {
        let added = false;
        for (let i = 0; i < toolbar.length; i++) {
            if (Array.isArray(toolbar[i]) && toolbar[i].includes('Link')) {
                toolbar[i].push('TESocialButton');
                added = true;
                break;
            }
        }
        if (!added) {
            toolbar.push(['TESocialButton']);
        }
    }

    console.log("[TE-SOCIAL-SYNDICATOR] Final transformed CKEditor 4 config:", config);
    return config;
};

const editorTransformer = {
    editorConfigTransformer,
};

export default editorTransformer;

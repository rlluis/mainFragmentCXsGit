/**
 * Native Custom Web Component Modal for Liferay AI Content Assistant
 * Integrates with Liferay AIHUB / Kaleo Workflow APIs.
 */

// We no longer need the EventSource polyfill! We are using 100% native fetch and standard HTTP.

class TEAIPromptModal extends HTMLElement {
    constructor() {
        super();
        this.onInsert = null;
        this.activeReader = null; // Track the active network stream reader for cleanup
    }

    connectedCallback() {
        // Create standard backdrop and modal content
        this.innerHTML = `
            <div class="te-ai-backdrop">
                <div class="te-ai-modal">
                    <!-- Header -->
                    <div class="te-ai-modal-header">
                        <div class="te-ai-modal-title">
                            <svg class="te-ai-sparkle-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 2L14.8 8.8L22 10L16.5 14.7L18.2 21.8L12 18L5.8 21.8L7.5 14.7L2 10L9.2 8.8L12 2Z" fill="currentColor"/>
                            </svg>
                            TE AI Content Assistant
                        </div>
                        <button class="te-ai-close-btn" id="te-ai-close" aria-label="Close">&times;</button>
                    </div>

                    <!-- Body -->
                    <div class="te-ai-modal-body">
                        <!-- Prompt Form -->
                        <div class="te-ai-form-group">
                            <label class="te-ai-label" for="te-ai-prompt">Instructions for AI Agent</label>
                            <textarea id="te-ai-prompt" class="te-ai-textarea" rows="4" placeholder="Tell the AI Agent what you would like to generate... (e.g. 'Generate a text about the Real Madrid elections', 'Write a short article about solar energy saving')"></textarea>
                        </div>

                        <!-- Quick Actions -->
                        <div class="te-ai-quick-actions">
                            <button class="te-ai-tag" data-prompt="Generate a 200-word summary of standard renewable energies">Summarize Solar Energy</button>
                            <button class="te-ai-tag" data-prompt="Write a short article about local sports elections">Sports Elections Article</button>
                            <button class="te-ai-tag" data-prompt="Draft a professional welcome letter to a new totalenergies club member">New Member Welcome</button>
                        </div>

                        <!-- Loading State -->
                        <div class="te-ai-loading-container" id="te-ai-loader" style="display: none;">
                            <div class="te-ai-spinner"></div>
                            <span>Contacting AIHUB Agent via Kaleo Workflow...</span>
                        </div>

                        <!-- Error State -->
                        <div class="te-ai-error-message" id="te-ai-error" style="display: none;"></div>

                        <!-- Results View -->
                        <div class="te-ai-result-box" id="te-ai-result-container" style="display: none;">
                            <label class="te-ai-label">Generated Response</label>
                            <textarea id="te-ai-result" class="te-ai-result-textarea" rows="7"></textarea>
                        </div>
                    </div>

                    <!-- Footer -->
                    <div class="te-ai-modal-footer">
                        <button class="btn btn-secondary te-ai-btn" id="te-ai-cancel-btn">Cancel</button>
                        <button class="btn btn-primary te-ai-btn" id="te-ai-submit-btn">Run AI Agent</button>
                        <button class="btn btn-success te-ai-btn" id="te-ai-insert-btn" style="display: none;">Insert into Editor</button>
                    </div>
                </div>
            </div>

            <style>
                .te-ai-backdrop {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100vw;
                    height: 100vh;
                    background-color: rgba(0, 0, 0, 0.5);
                    backdrop-filter: blur(4px);
                    z-index: 100000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                }
                .te-ai-modal {
                    background: #ffffff;
                    width: 100%;
                    max-width: 580px;
                    border-radius: 8px;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                    animation: te-slide-down 0.25s ease-out;
                }
                @keyframes te-slide-down {
                    from { transform: translateY(-20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .te-ai-modal-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 16px 20px;
                    border-bottom: 1px solid #e7e7ed;
                    background: #f8f9fa;
                }
                .te-ai-modal-title {
                    font-weight: 600;
                    font-size: 1.15rem;
                    color: #272833;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .te-ai-sparkle-icon {
                    width: 20px;
                    height: 20px;
                    color: #0b5fff;
                }
                .te-ai-close-btn {
                    background: none;
                    border: none;
                    font-size: 1.5rem;
                    cursor: pointer;
                    color: #6b6c7e;
                }
                .te-ai-close-btn:hover {
                    color: #272833;
                }
                .te-ai-modal-body {
                    padding: 20px;
                    max-height: 70vh;
                    overflow-y: auto;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }
                .te-ai-label {
                    font-weight: 600;
                    font-size: 0.85rem;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    color: #6b6c7e;
                    margin-bottom: 6px;
                    display: block;
                }
                .te-ai-textarea {
                    width: 100%;
                    border: 1px solid #cdced9;
                    border-radius: 6px;
                    padding: 10px 12px;
                    font-size: 0.95rem;
                    color: #272833;
                    transition: border-color 0.15s ease-in-out;
                    resize: vertical;
                }
                .te-ai-textarea:focus {
                    outline: none;
                    border-color: #0b5fff;
                    box-shadow: 0 0 0 3px rgba(11, 95, 255, 0.15);
                }
                .te-ai-quick-actions {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                }
                .te-ai-tag {
                    background: #f1f2f6;
                    border: 1px solid #e1e2ea;
                    border-radius: 16px;
                    padding: 6px 12px;
                    font-size: 0.8rem;
                    color: #4b4c5e;
                    cursor: pointer;
                    transition: all 0.15s ease;
                }
                .te-ai-tag:hover {
                    background: #0b5fff;
                    color: #ffffff;
                    border-color: #0b5fff;
                }
                .te-ai-loading-container {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px;
                    background: #f1f7ff;
                    border-radius: 6px;
                    font-size: 0.9rem;
                    color: #0b5fff;
                }
                .te-ai-spinner {
                    width: 20px;
                    height: 20px;
                    border: 3px solid rgba(11, 95, 255, 0.15);
                    border-top-color: #0b5fff;
                    border-radius: 50%;
                    animation: te-spin 0.8s linear infinite;
                }
                @keyframes te-spin {
                    to { transform: rotate(360deg); }
                }
                .te-ai-error-message {
                    padding: 12px;
                    background: #fff1f2;
                    border-left: 4px solid #da1e28;
                    border-radius: 4px;
                    font-size: 0.9rem;
                    color: #da1e28;
                }
                .te-ai-result-box {
                    animation: te-fade-in 0.2s ease-out;
                }
                @keyframes te-fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .te-ai-result-textarea {
                    width: 100%;
                    border: 1px solid #107c41;
                    border-radius: 6px;
                    padding: 10px 12px;
                    font-size: 0.95rem;
                    color: #272833;
                    background: #fbfdfa;
                    resize: vertical;
                }
                .te-ai-modal-footer {
                    display: flex;
                    align-items: center;
                    justify-content: flex-end;
                    padding: 16px 20px;
                    border-top: 1px solid #e7e7ed;
                    background: #f8f9fa;
                    gap: 10px;
                }
                .te-ai-btn {
                    padding: 8px 16px;
                    font-weight: 500;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 0.9rem;
                }
            </style>
        `;

        // Add action handlers
        this.querySelector('#te-ai-close').onclick = () => this.remove();
        this.querySelector('#te-ai-cancel-btn').onclick = () => this.remove();
        this.querySelector('#te-ai-submit-btn').onclick = () => this.callAIWorkflowAgent();
        this.querySelector('#te-ai-insert-btn').onclick = () => this.insertResult();

        // Connect quick action tags
        this.querySelectorAll('.te-ai-tag').forEach(tag => {
            tag.onclick = () => {
                this.querySelector('#te-ai-prompt').value = tag.getAttribute('data-prompt');
            };
        });
    }

    // Web component callback when element is removed from DOM (Cancel / Insert / Close)
    disconnectedCallback() {
        console.log("%c[TE-AIHUB-CONTRIBUTOR] Modal dismissed. Cleaning up connections...", "color: #9e9e9e;");
        if (this.activeReader) {
            try {
                this.activeReader.cancel(); // Abort and close the streaming HTTP socket immediately
                console.log("%c[TE-AIHUB-CONTRIBUTOR] 🛑 Stream connection successfully closed.", "color: #4caf50;");
            } catch (e) {
                console.warn("[TE-AIHUB-CONTRIBUTOR] Error closing active stream:", e);
            }
            this.activeReader = null;
        }
    }

    async postAuthorizationToken() {
        try {
            const authToken = typeof Liferay !== 'undefined' ? Liferay.authToken : '';
            console.log("%c[TE-AIHUB-CONTRIBUTOR] 🔑 Step 1: Requesting Authorization Tokens from local servlet...", "color: #ff9800; font-weight: bold;");
            
            const response = await fetch('/o/ai-hub-cell/v1.0/authorization-tokens', {
                method: 'POST',
                headers: {
                    'X-CSRF-Token': authToken
                }
            });

            if (!response.ok) {
                throw new Error(`Unable to generate authorization token: ${response.statusText}`);
            }

            const data = await response.json();

            if (!data?.accessToken) {
                throw new Error('Unable to generate authorization token.');
            }

            if (!data?.userToken) {
                throw new Error('Unable to generate user token.');
            }

            if (!data?.serviceURL) {
                throw new Error('Unable to find service URL.');
            }

            console.log("%c[TE-AIHUB-CONTRIBUTOR] 🔑 Authorization Tokens obtained successfully:", "color: #4caf50; font-weight: bold;", {
                serviceURL: data.serviceURL,
                accessTokenPreview: data.accessToken.substring(0, 15) + "...",
                userTokenPreview: data.userToken.substring(0, 15) + "..."
            });

            return data;
        } catch (error) {
            console.error("%c[TE-AIHUB-CONTRIBUTOR] ❌ Authorization failure:", "color: #f44336; font-weight: bold;", error);
            throw error;
        }
    }

    async callAIWorkflowAgent() {
        const prompt = this.querySelector('#te-ai-prompt').value.trim();
        if (!prompt) {
            this.showError('Please write instructions for the AI Agent before running.');
            return;
        }

        // Reset UI states
        this.hideError();
        this.showLoading();
        
        const resultTextArea = this.querySelector('#te-ai-result');
        resultTextArea.value = ''; // Clear old content
        this.querySelector('#te-ai-result-container').style.display = 'block';
        this.querySelector('#te-ai-insert-btn').style.display = 'none';

        // URL normalize helper to avoid double slashes like "http://localhost:8080//o/ai-hub"
        const joinUrls = (base, path) => {
            const b = base.endsWith('/') ? base.slice(0, -1) : base;
            const p = path.startsWith('/') ? path : '/' + path;
            return b + p;
        };

        try {
            console.log("%c[TE-AIHUB-CONTRIBUTOR] 🚀 Starting AI Handshake sequence...", "color: #2196f3; font-weight: bold; font-size: 1.1em;");
            
            // Retrieve Liferay authentication token for CSRF protection
            const authToken = typeof Liferay !== 'undefined' ? Liferay.authToken : '';
            console.log("[TE-AIHUB-CONTRIBUTOR] Local CSRF Token length:", authToken.length);

            // 1. Get the Authorization Token from AI Hub Cell
            const authorizationToken = await this.postAuthorizationToken();
            if (!authorizationToken) {
                throw new Error("Could not authorize with Liferay AI Hub.");
            }

            const { accessToken, userToken, serviceURL } = authorizationToken;

            // Helper function to send the POST trigger after receiving the key
            const triggerAgentPOST = async (sseEventSinkKey) => {
                const postUrl = joinUrls(serviceURL, '/o/ai-hub/v1.0/agent-instances');
                console.log("%c[TE-AIHUB-CONTRIBUTOR] 📤 Step 3: Posting message to trigger AgentInstance...", "color: #3f51b5; font-weight: bold;");
                console.log("[TE-AIHUB-CONTRIBUTOR] Destination URL:", postUrl);
                console.log("[TE-AIHUB-CONTRIBUTOR] Handshake Channel ID (sseEventSinkKey):", sseEventSinkKey);

                const headers = new Headers({
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                    'Liferay-AI-Hub-Cell-On-Behalf-Of': userToken
                });

                if (authToken) {
                    headers.append('X-CSRF-Token', authToken);
                }

                // Map 'prompt' to 'text' as expected by the AI Agent Input Variable
                const payload = {
                    agentDefinitionExternalReferenceCode: "AIHUB-AGENT-CREATETEXT",
                    sseEventSinkKey: sseEventSinkKey,
                    context: {
                        text: prompt,
                        language: typeof Liferay !== 'undefined' ? Liferay.ThemeDisplay.getLanguageId() : 'en-US'
                    }
                };

                console.log("[TE-AIHUB-CONTRIBUTOR] Trigger Payload:", payload);

                const response = await fetch(postUrl, {
                    method: 'POST',
                    headers: headers,
                    body: JSON.stringify(payload)
                });

                console.log("%c[TE-AIHUB-CONTRIBUTOR] Trigger Response status:", "color: #4caf50; font-weight: bold;", response.status);

                if (!response.ok) {
                    throw new Error(`API Error (HTTP ${response.status}): Unable to trigger AgentInstance.`);
                }
            };

            // 2. Open standard HTTP GET request with streaming reader to subscribe!
            const subscribeUrl = joinUrls(serviceURL, '/o/ai-hub/v1.0/agent-instances/subscribe');
            console.log("%c[TE-AIHUB-CONTRIBUTOR] 📡 Step 2: Subscribing to EventStream via native Fetch Reader...", "color: #9c27b0; font-weight: bold;", subscribeUrl);

            const subscribeHeaders = new Headers({
                'Accept': 'text/event-stream, text/plain, */*',
                'Authorization': `Bearer ${accessToken}`,
                'Liferay-AI-Hub-Cell-On-Behalf-Of': userToken
            });
            if (authToken) {
                subscribeHeaders.append('X-CSRF-Token', authToken);
            }

            const response = await fetch(subscribeUrl, {
                method: 'GET',
                headers: subscribeHeaders
            });

            console.log("%c[TE-AIHUB-CONTRIBUTOR] 🔓 SSE Connection response received:", "color: #4caf50; font-weight: bold;", response.status);

            if (!response.ok) {
                throw new Error(`SSE Subscription Error (HTTP ${response.status})`);
            }

            // Start reading the stream asynchronously!
            this.activeReader = response.body.getReader();
            const decoder = new TextDecoder();
            let streamBuffer = '';
            let isFirstMessage = true;

            // Run stream reading loop
            (async () => {
                try {
                    while (true) {
                        const { value, done } = await this.activeReader.read();
                        if (done) {
                            console.log("%c[TE-AIHUB-CONTRIBUTOR] 🏁 Stream reader reached EOF.", "color: #4caf50; font-weight: bold;");
                            if (this.activeReader) {
                                this.activeReader.cancel(); // Release socket back to the pool
                                this.activeReader = null;
                            }
                            break;
                        }

                        // Decode and append chunk to buffer
                        const chunk = decoder.decode(value, { stream: true });
                        streamBuffer += chunk;

                        // Process buffered data by lines
                        const lines = streamBuffer.split('\n');
                        streamBuffer = lines.pop() || ''; // Keep trailing partial line in buffer

                        for (const line of lines) {
                            let trimmed = line.trim();
                            if (!trimmed) continue;

                            console.log("%c[TE-AIHUB-CONTRIBUTOR] Raw stream line chunk:", "color: #e91e63;", trimmed);

                            // Clean data prefix if present (data: ...)
                            let dataContent = trimmed;
                            if (trimmed.startsWith('data:')) {
                                dataContent = trimmed.substring(5).trim();
                            }
                            if (trimmed.startsWith('event:')) {
                                // Skip event marker line
                                continue;
                            }

                            // 1. First event contains the server-generated sseEventSinkKey (Handshake Channel ID)
                            if (isFirstMessage) {
                                isFirstMessage = false;
                                let serverAssignedKey = dataContent;
                                try {
                                    // See if it is a JSON object
                                    const data = JSON.parse(dataContent);
                                    serverAssignedKey = data.sseEventSinkKey || data.id || dataContent;
                                } catch (e) {
                                    // It is raw text
                                    serverAssignedKey = dataContent;
                                }

                                console.log("%c[TE-AIHUB-CONTRIBUTOR] 🎯 Handshake complete! Server-assigned key:", "color: #4caf50; font-weight: bold; font-size: 1.1em;", serverAssignedKey);

                                // Asynchronously trigger the POST request to start agent work
                                triggerAgentPOST(serverAssignedKey).catch(err => {
                                    console.error("[TE-AIHUB-CONTRIBUTOR] Error in triggerAgentPOST:", err);
                                    this.showError(err.message || 'An unexpected error occurred while communicating with the AI Agent.');
                                    this.hideLoading();
                                    if (this.activeReader) {
                                        this.activeReader.cancel();
                                        this.activeReader = null;
                                    }
                                });
                                continue;
                            }

                            // 2. Subsequent events stream the text tokens from LLM
                            console.log("%c[TE-AIHUB-CONTRIBUTOR] 📥 Step 4: Streaming answer chunk...", "color: #009688;");
                            try {
                                const parsed = JSON.parse(dataContent);
                                if (parsed.data) {
                                    resultTextArea.value += parsed.data; // Extract only the generated content chunk
                                    
                                    // 🚀 WE ARE DONE! The text block has arrived, so we can close the channel immediately!
                                    console.log("%c[TE-AIHUB-CONTRIBUTOR] ✅ Generation complete! Auto-closing stream connection.", "color: #4caf50; font-weight: bold;");
                                    this.hideLoading();
                                    this.querySelector('#te-ai-insert-btn').style.display = 'block';

                                    if (this.activeReader) {
                                        this.activeReader.cancel(); // Cancel stream reader to close the GET request immediately!
                                        this.activeReader = null;
                                    }
                                    return; // Stop processing further lines and exit the thread
                                } else if (parsed.content) {
                                    resultTextArea.value += parsed.content;
                                    
                                    // Fallback done trigger for other formats
                                    console.log("%c[TE-AIHUB-CONTRIBUTOR] ✅ Generation complete (fallback)! Auto-closing stream.", "color: #4caf50; font-weight: bold;");
                                    this.hideLoading();
                                    this.querySelector('#te-ai-insert-btn').style.display = 'block';

                                    if (this.activeReader) {
                                        this.activeReader.cancel();
                                        this.activeReader = null;
                                    }
                                    return;
                                } else {
                                    resultTextArea.value += dataContent;
                                }
                            } catch (err) {
                                // If raw string
                                resultTextArea.value += dataContent;
                            }
                        }
                    }
                } catch (streamErr) {
                    console.error("[TE-AIHUB-CONTRIBUTOR] Stream reading error or stream cancelled intentionally:", streamErr);
                } finally {
                    this.hideLoading();
                    this.querySelector('#te-ai-insert-btn').style.display = 'block';
                }
            })();

        } catch (err) {
            console.error("%c[TE-AIHUB-CONTRIBUTOR] ❌ Handshake sequence error:", "color: #f44336; font-weight: bold;", err);
            this.showError(err.message || 'An unexpected error occurred while communicating with the AI Agent.');
            this.hideLoading();
            if (this.activeReader) {
                this.activeReader.cancel();
                this.activeReader = null;
            }
        }
    }

    insertResult() {
        const resultText = this.querySelector('#te-ai-result').value;
        if (this.onInsert && resultText) {
            this.onInsert(resultText);
        }
        this.remove();
    }

    showError(msg) {
        const errEl = this.querySelector('#te-ai-error');
        errEl.innerText = msg;
        errEl.style.display = 'block';
    }

    hideError() {
        this.querySelector('#te-ai-error').style.display = 'none';
    }

    showLoading() {
        this.querySelector('#te-ai-loader').style.display = 'flex';
        this.querySelector('#te-ai-submit-btn').disabled = true;
    }

    hideLoading() {
        this.querySelector('#te-ai-loader').style.display = 'none';
        this.querySelector('#te-ai-submit-btn').disabled = false;
    }
}

// Ensure the custom element is only defined once
if (!customElements.get('te-ai-prompt-modal')) {
    customElements.define('te-ai-prompt-modal', TEAIPromptModal);
}

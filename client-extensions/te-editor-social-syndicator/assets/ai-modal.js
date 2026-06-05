/**
 * Native Custom Web Component Modal for Liferay AI Social Media Syndicator
 * Dynamically queries active social networks from Liferay Objects, compiles combined prompts,
 * and presents copy-pasteable drafts in a gorgeous multi-tab layout.
 */

class TESocialPromptModal extends HTMLElement {
    constructor() {
        super();
        this._editorText = '';
        this.socialNetworks = []; // Loaded dynamically from Liferay Object engine
        this.activeReader = null; // Track active stream connection for clean closing
    }

    set editorText(value) {
        // Strip HTML tags for clean text context
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = value || '';
        this._editorText = tempDiv.textContent || tempDiv.innerText || '';
    }

    get editorText() {
        return this._editorText;
    }

    async connectedCallback() {
        // Render base structure with loading indicator
        this.innerHTML = `
            <div class="te-social-backdrop">
                <div class="te-social-modal">
                    <!-- Header -->
                    <div class="te-social-modal-header">
                        <div class="te-social-modal-title">
                            <svg class="te-social-share-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M18 16.08C17.24 16.08 16.56 16.38 16.04 16.85L8.91 12.7C8.96 12.47 9 12.24 9 12C9 11.76 8.96 11.53 8.91 11.3L15.96 7.19C16.5 7.69 17.21 8 18 8C19.66 8 21 6.66 21 5C21 3.34 19.66 2 18 2C16.34 2 15 3.34 15 5C15 5.24 15.04 5.47 15.09 5.7L8.04 9.81C7.5 9.31 6.79 9 6 9C4.34 9 3 10.34 3 12C3 13.66 4.34 15 6 15C6.79 15 7.5 14.69 8.04 14.19L15.16 18.35C15.11 18.56 15.08 18.78 15.08 19C15.08 20.61 16.39 21.91 18 21.91C19.61 21.91 20.92 20.61 20.92 19C20.92 17.39 19.61 16.08 18 16.08Z" fill="currentColor"/>
                            </svg>
                            TE AI Social Media Syndicator
                        </div>
                        <button class="te-social-close-btn" id="te-social-close" aria-label="Close">&times;</button>
                    </div>

                    <!-- Config Fetch State -->
                    <div class="te-social-modal-body" id="te-social-config-loader">
                        <div class="te-social-loading-container" style="display: flex; justify-content: center; flex-direction: column; align-items: center; padding: 40px 0;">
                            <div class="te-social-spinner"></div>
                            <span style="margin-top: 15px; font-weight: 500; color: #3f51b5;">Querying Liferay Object Configurations...</span>
                        </div>
                    </div>

                    <!-- Main Body (Hidden until configs load) -->
                    <div class="te-social-modal-body" id="te-social-main-body" style="display: none;">
                        <!-- Form Section -->
                        <div id="te-social-form">
                            <!-- Social Choice Checkboxes -->
                            <div class="te-social-form-group">
                                <label class="te-social-label">Target Social Channels</label>
                                <div class="te-social-checkbox-grid" id="te-social-channels-list">
                                    <!-- Populated dynamically -->
                                </div>
                            </div>

                            <!-- Additional Prompt -->
                            <div class="te-social-form-group" style="margin-top: 15px;">
                                <label class="te-social-label" for="te-social-prompt">Custom Guidelines / Context (Optional)</label>
                                <textarea id="te-social-prompt" class="te-social-textarea" rows="3" placeholder="Add specific keywords, campaign names, or context (e.g., 'Targeting green energy business leaders', 'Include campaign tag #SolarTotalEnergies')"></textarea>
                            </div>
                        </div>

                        <!-- Loading State -->
                        <div class="te-social-loading-container" id="te-social-loader" style="display: none; padding: 30px 0;">
                            <div class="te-social-spinner"></div>
                            <span id="te-social-loader-text">Authorizing and establishing secure channel...</span>
                        </div>

                        <!-- Error State -->
                        <div class="te-social-error-message" id="te-social-error" style="display: none;"></div>

                        <!-- Results Multi-Tab View -->
                        <div class="te-social-result-box" id="te-social-result-container" style="display: none;">
                            <label class="te-social-label">Generated Social Drafts</label>
                            
                            <!-- Tabs Headers -->
                            <div class="te-social-tabs-header" id="te-social-tab-headers">
                                <!-- Populated dynamically -->
                            </div>

                            <!-- Tabs Content -->
                            <div class="te-social-tabs-content" id="te-social-tab-content-area">
                                <!-- Populated dynamically -->
                            </div>
                        </div>
                    </div>

                    <!-- Footer -->
                    <div class="te-social-modal-footer">
                        <button class="btn btn-secondary te-social-btn" id="te-social-cancel-btn">Cancel</button>
                        <button class="btn btn-primary te-social-btn" id="te-social-submit-btn" style="display: none;">Generate Social Drafts</button>
                        <button class="btn btn-secondary te-social-btn" id="te-social-done-btn" style="display: none;">Close</button>
                    </div>
                </div>
            </div>

            <style>
                .te-social-backdrop {
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
                .te-social-modal {
                    background: #ffffff;
                    width: 100%;
                    max-width: 600px;
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
                .te-social-modal-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 16px 20px;
                    border-bottom: 1px solid #e7e7ed;
                    background: #f8f9fa;
                }
                .te-social-modal-title {
                    font-weight: 600;
                    font-size: 1.15rem;
                    color: #272833;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .te-social-share-icon {
                    width: 20px;
                    height: 20px;
                    color: #3f51b5;
                }
                .te-social-close-btn {
                    background: none;
                    border: none;
                    font-size: 1.5rem;
                    cursor: pointer;
                    color: #6b6c7e;
                }
                .te-social-close-btn:hover {
                    color: #272833;
                }
                .te-social-modal-body {
                    padding: 20px;
                    max-height: 70vh;
                    overflow-y: auto;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }
                .te-social-label {
                    font-weight: 600;
                    font-size: 0.85rem;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    color: #6b6c7e;
                    margin-bottom: 8px;
                    display: block;
                }
                .te-social-checkbox-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 10px;
                    background: #f8f9fa;
                    border: 1px solid #cdced9;
                    border-radius: 6px;
                    padding: 12px;
                }
                .te-social-checkbox-label {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 0.95rem;
                    color: #272833;
                    cursor: pointer;
                    padding: 4px;
                }
                .te-social-checkbox {
                    width: 16px;
                    height: 16px;
                    cursor: pointer;
                }
                .te-social-textarea {
                    width: 100%;
                    border: 1px solid #cdced9;
                    border-radius: 6px;
                    padding: 10px 12px;
                    font-size: 0.95rem;
                    color: #272833;
                    transition: border-color 0.15s ease-in-out;
                    resize: vertical;
                }
                .te-social-textarea:focus {
                    outline: none;
                    border-color: #3f51b5;
                    box-shadow: 0 0 0 3px rgba(63, 81, 181, 0.15);
                }
                .te-social-loading-container {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px;
                    background: #f1f2fc;
                    border-radius: 6px;
                    font-size: 0.9rem;
                    color: #3f51b5;
                    justify-content: center;
                }
                .te-social-spinner {
                    width: 22px;
                    height: 22px;
                    border: 3px solid rgba(63, 81, 181, 0.15);
                    border-top-color: #3f51b5;
                    border-radius: 50%;
                    animation: te-spin 0.8s linear infinite;
                }
                @keyframes te-spin {
                    to { transform: rotate(360deg); }
                }
                .te-social-error-message {
                    padding: 12px;
                    background: #fff1f2;
                    border-left: 4px solid #da1e28;
                    border-radius: 4px;
                    font-size: 0.9rem;
                    color: #da1e28;
                }
                
                /* Tabs Styling */
                .te-social-tabs-header {
                    display: flex;
                    border-bottom: 2px solid #e7e7ed;
                    margin-bottom: 12px;
                    gap: 4px;
                    overflow-x: auto;
                }
                .te-social-tab-btn {
                    padding: 8px 16px;
                    background: none;
                    border: none;
                    border-bottom: 2px solid transparent;
                    font-weight: 500;
                    color: #6b6c7e;
                    cursor: pointer;
                    font-size: 0.95rem;
                    transition: all 0.15s ease;
                    white-space: nowrap;
                }
                .te-social-tab-btn:hover {
                    color: #3f51b5;
                }
                .te-social-tab-btn.active {
                    color: #3f51b5;
                    border-bottom-color: #3f51b5;
                    font-weight: 600;
                }
                .te-social-tabs-content {
                    background: #f8f9fa;
                    border: 1px solid #e7e7ed;
                    border-radius: 6px;
                    padding: 12px;
                }
                .te-social-tab-pane {
                    display: none;
                    flex-direction: column;
                    gap: 10px;
                }
                .te-social-tab-pane.active {
                    display: flex;
                    animation: te-fade-in 0.2s ease-out;
                }
                @keyframes te-fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .te-social-draft-textarea {
                    width: 100%;
                    border: 1px solid #cdced9;
                    border-radius: 6px;
                    padding: 10px 12px;
                    font-size: 0.95rem;
                    color: #272833;
                    background: #ffffff;
                    resize: vertical;
                    font-family: inherit;
                }
                .te-social-pane-actions {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .te-social-copy-success {
                    font-size: 0.85rem;
                    color: #107c41;
                    font-weight: bold;
                    display: none;
                }
                
                .te-social-modal-footer {
                    display: flex;
                    align-items: center;
                    justify-content: flex-end;
                    padding: 16px 20px;
                    border-top: 1px solid #e7e7ed;
                    background: #f8f9fa;
                    gap: 10px;
                }
                .te-social-btn {
                    padding: 8px 16px;
                    font-weight: 500;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 0.9rem;
                }
            </style>
        `;

        // Register basic button handlers
        this.querySelector('#te-social-close').onclick = () => this.remove();
        this.querySelector('#te-social-cancel-btn').onclick = () => this.remove();
        this.querySelector('#te-social-done-btn').onclick = () => this.remove();
        this.querySelector('#te-social-submit-btn').onclick = () => this.generateSocialDrafts();

        // Dynamically fetch and initialize configurations (using standard Liferay.Util.fetch)
        await this.initializeSocialConfig();
    }

    // Helper to sanitize platform name into a completely valid CSS Selector ID (replaces spaces/special chars with hyphens)
    sanitizeId(name) {
        return (name || '').replace(/[^a-zA-Z0-9]/g, '-');
    }

    // Web component callback when element is removed from DOM (Cancel / Close)
    disconnectedCallback() {
        console.log("%c[TE-SOCIAL-SYNDICATOR] Modal dismissed. Cleaning up connections...", "color: #9e9e9e;");
        if (this.activeReader) {
            try {
                this.activeReader.cancel(); // Abort and close the streaming HTTP socket immediately
                console.log("%c[TE-SOCIAL-SYNDICATOR] 🛑 Stream connection successfully closed.", "color: #4caf50;");
            } catch (e) {
                console.warn("[TE-SOCIAL-SYNDICATOR] Error closing active stream:", e);
            }
            this.activeReader = null;
        }
    }

    // Queries standard active objects from Liferay Objects engine using OOTB Liferay.Util.fetch (manages same-origin auth, cookies, and session natively!)
    async initializeSocialConfig() {
        const objectEndpoint = '/o/c/aihubsocialnetworks/';
        console.log("%c[TE-SOCIAL-SYNDICATOR] 📡 Initializing Liferay Object configs...", "color: #ff9800; font-weight: bold;");

        try {
            let response;
            // Use Liferay's built-in fetch utility which automatically carries the active session context of test@liferay.com!
            if (typeof Liferay !== 'undefined' && Liferay.Util && Liferay.Util.fetch) {
                console.log("[TE-SOCIAL-SYNDICATOR] 📡 Fetching Object Configurations via standard Liferay.Util.fetch from endpoint: " + objectEndpoint);
                response = await Liferay.Util.fetch(objectEndpoint);
            } else {
                console.log("[TE-SOCIAL-SYNDICATOR] 📡 Liferay.Util.fetch not available. Falling back to native fetch...");
                response = await fetch(objectEndpoint, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json'
                    }
                });
            }

            console.log("%c[TE-SOCIAL-SYNDICATOR] 📡 Object fetch response status: " + response.status, "color: #2196f3; font-weight: bold;");

            if (response.ok) {
                const data = await response.json();
                console.log("[TE-SOCIAL-SYNDICATOR] Header Object Response payload:", data);
                
                this.socialNetworks = data.items || [];
                console.log("%c[TE-SOCIAL-SYNDICATOR] Headless Liferay Objects fetched successfully. Active platforms: " + this.socialNetworks.length, "color: #4caf50; font-weight: bold;");
                
                // If response is successful but items are empty, seamlessly fall back to default networks so the UI remains active and testable!
                if (this.socialNetworks.length === 0) {
                    console.warn("[TE-SOCIAL-SYNDICATOR] Object database returned an empty items array. Loading default fallback social networks.");
                    this.socialNetworks = this.getDefaultSocialNetworks();
                }
            } else {
                console.warn("[TE-SOCIAL-SYNDICATOR] Liferay Object endpoint returned non-200. Falling back to default social config.");
                this.socialNetworks = this.getDefaultSocialNetworks();
            }
        } catch (err) {
            console.warn("[TE-SOCIAL-SYNDICATOR] Failed to query Headless Liferay Objects. Falling back to default social config.", err);
            this.socialNetworks = this.getDefaultSocialNetworks();
        }

        // Hide config loader, reveal main form
        this.querySelector('#te-social-config-loader').style.display = 'none';
        this.querySelector('#te-social-main-body').style.display = 'block';
        this.querySelector('#te-social-submit-btn').style.display = 'block';

        // Render target checkboxes in the UI
        const grid = this.querySelector('#te-social-channels-list');
        if (this.socialNetworks.length === 0) {
            grid.innerHTML = `<span style="grid-column: span 2; color: #6b6c7e; font-style: italic; font-size: 0.9rem;">No active social networks configured. Please configure them in Control Panel -> Objects.</span>`;
            this.querySelector('#te-social-submit-btn').disabled = true;
            return;
        }

        grid.innerHTML = this.socialNetworks.map(net => `
            <label class="te-social-checkbox-label">
                <input type="checkbox" class="te-social-checkbox" value="${net.name}" checked>
                ${net.name}
            </label>
        `).join('');
    }

    // Default configuration if Liferay Object is not configured yet (great for bootstrapping!)
    getDefaultSocialNetworks() {
        return [
            {
                name: "LinkedIn",
                instructions: "Write a professional B2B hook, explain 3 key takeaways from the article in bullet points, maintain a business-casual tone, and add 3 relevant industry hashtags."
            },
            {
                name: "Twitter/X",
                instructions: "Write a short, high-engagement hook using emojis, include a strong Call-to-Action to read the article, and use under 280 characters."
            },
            {
                name: "Facebook",
                instructions: "Write an engaging, personal, and conversational paragraph summary, encourage user engagement/comments, and add a link placeholder."
            }
        ];
    }

    async postAuthorizationToken() {
        try {
            const authToken = typeof Liferay !== 'undefined' ? Liferay.authToken : '';
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

            return data;
        } catch (error) {
            console.error("[TE-SOCIAL-SYNDICATOR] Authorization failure:", error);
            throw error;
        }
    }

    async generateSocialDrafts() {
        // Collect checked platforms
        const checkedBoxes = this.querySelectorAll('.te-social-checkbox:checked');
        if (checkedBoxes.length === 0) {
            this.showError("Please select at least one social media channel.");
            return;
        }

        const selectedNames = Array.from(checkedBoxes).map(box => box.value);
        const selectedNetworks = this.socialNetworks.filter(net => selectedNames.includes(net.name));
        const userPrompt = this.querySelector('#te-social-prompt').value.trim();

        // Retrieve Liferay authentication token for CSRF protection
        const authToken = typeof Liferay !== 'undefined' ? Liferay.authToken : '';

        // Reset states
        this.hideError();
        this.showLoading("Authorizing and preparing handshake...");

        // URL normalize helper to avoid double slashes like "http://localhost:8080//o/ai-hub"
        const joinUrls = (base, path) => {
            const b = base.endsWith('/') ? base.slice(0, -1) : base;
            const p = path.startsWith('/') ? path : '/' + path;
            return b + p;
        };

        try {
            // 1. Get the Authorization Token from AI Hub Cell
            const authorizationToken = await this.postAuthorizationToken();
            if (!authorizationToken) {
                throw new Error("Could not authorize with Liferay AI Hub.");
            }

            const { accessToken, userToken, serviceURL } = authorizationToken;

            // Helper function to send the POST trigger after receiving the key
            const triggerAgentPOST = async (sseEventSinkKey) => {
                const postUrl = joinUrls(serviceURL, '/o/ai-hub/v1.0/agent-instances');
                console.log("%c[TE-SOCIAL-SYNDICATOR] 📤 Step 3: Posting message to trigger AgentInstance...", "color: #3f51b5; font-weight: bold;");
                console.log("[TE-SOCIAL-SYNDICATOR] Destination URL:", postUrl);
                console.log("[TE-SOCIAL-SYNDICATOR] Handshake Channel ID (sseEventSinkKey):", sseEventSinkKey);

                const headers = new Headers({
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                    'Liferay-AI-Hub-Cell-On-Behalf-Of': userToken
                });

                if (authToken) {
                    headers.append('X-CSRF-Token', authToken);
                }

                const payload = {
                    agentDefinitionExternalReferenceCode: "AIHUB-AGENT-SOCIALSYNDICATE",
                    sseEventSinkKey: sseEventSinkKey,
                    context: {
                        text: `ARTICLE CONTENT:\n${this.editorText}\n\nINSTRUCTIONS AND SOCIAL GUIDELINES:\n${combinedInstructions}`,
                        language: typeof Liferay !== 'undefined' ? Liferay.ThemeDisplay.getLanguageId() : 'en-US'
                    }
                };

                console.log("[TE-SOCIAL-SYNDICATOR] Trigger Payload:", payload);

                const response = await fetch(postUrl, {
                    method: 'POST',
                    headers: headers,
                    body: JSON.stringify(payload)
                });

                console.log("%c[TE-SOCIAL-SYNDICATOR] Trigger Response status:", "color: #4caf50; font-weight: bold;", response.status);

                if (!response.ok) {
                    throw new Error(`API Error (HTTP ${response.status}): Unable to trigger Social Syndicator Agent.`);
                }
            };

            // 2. Open standard HTTP GET request with streaming reader to subscribe!
            const subscribeUrl = joinUrls(serviceURL, '/o/ai-hub/v1.0/agent-instances/subscribe');
            console.log("%c[TE-SOCIAL-SYNDICATOR] 📡 Step 2: Subscribing to EventStream via native Fetch Reader...", "color: #9c27b0; font-weight: bold;", subscribeUrl);

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

            console.log("%c[TE-SOCIAL-SYNDICATOR] 🔓 SSE Connection response received:", "color: #4caf50; font-weight: bold;", response.status);

            if (!response.ok) {
                throw new Error(`SSE Subscription Error (HTTP ${response.status})`);
            }

            // Start reading the stream asynchronously!
            this.activeReader = response.body.getReader();
            const decoder = new TextDecoder();
            let streamBuffer = '';
            let isFirstMessage = true;

            // 3. Compose combined generation prompt guidelines
            let combinedInstructions = "Create highly optimized, promotional drafts of the provided article for these selected platforms. Maintain exceptional quality, and return drafts strictly according to each platform's instructions.\n\n";
            
            selectedNetworks.forEach(net => {
                combinedInstructions += `- Platform [${net.name}]:\n  Instructions: ${net.instructions}\n\n`;
            });

            if (userPrompt) {
                combinedInstructions += `Additional User Guidelines / Context to incorporate:\n${userPrompt}\n\n`;
            }

            combinedInstructions += "\nCRITICAL RESPONSE REQUIREMENT: Return your response strictly as a JSON object, where the keys are the exact platform names, and the values are the generated drafts. For example:\n{\n";
            selectedNetworks.forEach((net, i) => {
                combinedInstructions += `  "${net.name}": "[promotional draft text here]"\n${i < selectedNetworks.length - 1 ? ',' : ''}`;
            });
            combinedInstructions += "\n}\n\nDo not write any markdown blocks, wrappers, or explanations outside the JSON object.";

            // Run stream reading loop
            (async () => {
                try {
                    while (true) {
                        const { value, done } = await this.activeReader.read();
                        if (done) {
                            console.log("%c[TE-SOCIAL-SYNDICATOR] 🏁 Stream reader reached EOF.", "color: #4caf50; font-weight: bold;");
                            if (this.activeReader) {
                                this.activeReader.cancel();
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

                            console.log("%c[TE-SOCIAL-SYNDICATOR] Raw stream line chunk:", "color: #e91e63;", trimmed);

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

                                console.log("%c[TE-SOCIAL-SYNDICATOR] 🎯 Handshake complete! Server-assigned key:", "color: #4caf50; font-weight: bold; font-size: 1.1em;", serverAssignedKey);

                                // Asynchronously trigger the POST request to start agent work
                                triggerAgentPOST(serverAssignedKey).catch(err => {
                                    console.error("[TE-SOCIAL-SYNDICATOR] Error in triggerAgentPOST:", err);
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
                            console.log("%c[TE-SOCIAL-SYNDICATOR] 📥 Step 4: Streaming answer chunk...", "color: #009688;");
                            try {
                                const parsed = JSON.parse(dataContent);
                                if (parsed.data) {
                                    // 🚀 WE ARE DONE! The text block has arrived, so we can close the channel immediately!
                                    console.log("%c[TE-SOCIAL-SYNDICATOR] ✅ Generation complete! Auto-closing stream connection.", "color: #4caf50; font-weight: bold;");
                                    this.hideLoading();

                                    // Parse response into structured drafts
                                    const rawDraftsText = parsed.data;
                                    console.log("[TE-SOCIAL-SYNDICATOR] Clean drafts content from stream:", rawDraftsText);

                                    let cleanedJSON = rawDraftsText.trim();
                                    if (cleanedJSON.startsWith("```")) {
                                        cleanedJSON = cleanedJSON.replace(/^```[a-zA-Z]*/, "").replace(/```$/, "").trim();
                                    }

                                    let draftsMap = {};
                                    try {
                                        draftsMap = JSON.parse(cleanedJSON);
                                    } catch (jsonErr) {
                                        console.warn("[TE-SOCIAL-SYNDICATOR] JSON parse failed, splitting by platforms fallback.", jsonErr);
                                        selectedNetworks.forEach(net => {
                                            draftsMap[net.name] = rawDraftsText;
                                        });
                                    }

                                    // Hide form and loader, show results multi-tab
                                    this.querySelector('#te-social-form').style.display = 'none';
                                    this.querySelector('#te-social-loader').style.display = 'none';
                                    this.querySelector('#te-social-submit-btn').style.display = 'none';

                                    this.querySelector('#te-social-result-container').style.display = 'block';
                                    this.querySelector('#te-social-done-btn').style.display = 'block';

                                    // Populate Tabs Headers and Contents dynamically
                                    this.renderDraftsTabs(draftsMap);

                                    if (this.activeReader) {
                                        this.activeReader.cancel(); // Cancel stream reader to close the GET request immediately!
                                        this.activeReader = null;
                                    }
                                    return; // Stop processing further lines and exit the thread
                                } else {
                                    // Fallback if not standard format
                                    console.log("[TE-SOCIAL-SYNDICATOR] Raw non-data chunk:", dataContent);
                                }
                            } catch (err) {
                                // If raw string
                                console.log("[TE-SOCIAL-SYNDICATOR] Raw exception text:", dataContent);
                            }
                        }
                    }
                } catch (streamErr) {
                    console.error("[TE-SOCIAL-SYNDICATOR] Stream reading error or stream cancelled intentionally:", streamErr);
                } finally {
                    this.hideLoading();
                }
            })();

        } catch (err) {
            console.error("[TE-SOCIAL-SYNDICATOR] Handshake sequence error:", err);
            this.showError(err.message || 'An unexpected error occurred while communicating with the AI Agent.');
            this.hideLoading();
            if (this.activeReader) {
                this.activeReader.cancel();
                this.activeReader = null;
            }
        }
    }

    renderDraftsTabs(draftsMap) {
        const headersContainer = this.querySelector('#te-social-tab-headers');
        const contentContainer = this.querySelector('#te-social-tab-content-area');

        const platforms = Object.keys(draftsMap);
        if (platforms.length === 0) {
            contentContainer.innerHTML = `<span style="color: #da1e28; font-style: italic;">No drafts were generated by the AI Agent. Please try again.</span>`;
            return;
        }

        // Render Tab Buttons (using sanitizeId to avoid reserved CSS characters like "/")
        headersContainer.innerHTML = platforms.map((platform, idx) => `
            <button class="te-social-tab-btn ${idx === 0 ? 'active' : ''}" data-tab="${this.sanitizeId(platform)}">
                ${platform}
            </button>
        `).join('');

        // Render Tab Panes (using sanitizeId for safe, valid CSS IDs)
        contentContainer.innerHTML = platforms.map((platform, idx) => `
            <div class="te-social-tab-pane ${idx === 0 ? 'active' : ''}" id="pane-${this.sanitizeId(platform)}">
                <textarea class="te-social-draft-textarea" rows="6" readonly>${draftsMap[platform]}</textarea>
                <div class="te-social-pane-actions">
                    <span class="te-social-copy-success" id="success-${this.sanitizeId(platform)}">Draft copied to clipboard!</span>
                    <button class="btn btn-primary te-social-btn copy-btn" data-platform="${this.sanitizeId(platform)}">
                        Copy ${platform} Draft
                    </button>
                </div>
            </div>
        `).join('');

        // Wire Tab Switch handlers
        const buttons = this.querySelectorAll('.te-social-tab-btn');
        buttons.forEach(btn => {
            btn.onclick = () => {
                const targetPlatformId = btn.getAttribute('data-tab'); // e.g. "Twitter-X"
                
                // Toggle header buttons
                buttons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // Toggle content panes
                this.querySelectorAll('.te-social-tab-pane').forEach(pane => pane.classList.remove('active'));
                this.querySelector(`#pane-${targetPlatformId}`).classList.add('active');
            };
        });

        // Wire Copy-to-Clipboard handlers
        const copyButtons = this.querySelectorAll('.copy-btn');
        copyButtons.forEach(btn => {
            btn.onclick = async () => {
                const platformId = btn.getAttribute('data-platform'); // e.g. "Twitter-X"
                const textValue = this.querySelector(`#pane-${platformId} textarea`).value;

                try {
                    await navigator.clipboard.writeText(textValue);
                    
                    // Show success indicator
                    const successLabel = this.querySelector(`#success-${platformId}`);
                    successLabel.style.display = 'block';
                    setTimeout(() => {
                        successLabel.style.display = 'none';
                    }, 2000);
                } catch (err) {
                    console.error("Failed to copy text:", err);
                }
            };
        });
    }

    showError(msg) {
        const errEl = this.querySelector('#te-social-error');
        errEl.innerText = msg;
        errEl.style.display = 'block';
    }

    hideError() {
        this.querySelector('#te-social-error').style.display = 'none';
    }

    showLoading(text) {
        const loader = this.querySelector('#te-social-loader');
        this.querySelector('#te-social-loader-text').innerText = text;
        loader.style.display = 'flex';
        this.querySelector('#te-social-submit-btn').disabled = true;
    }

    hideLoading() {
        this.querySelector('#te-social-loader').style.display = 'none';
        this.querySelector('#te-social-submit-btn').disabled = false;
    }
}

// Ensure the custom element is only defined once
if (!customElements.get('te-social-prompt-modal')) {
    customElements.define('te-social-prompt-modal', TESocialPromptModal);
}

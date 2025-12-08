function JsonRepeaterField(fragmentElement, configuration) {
	const hiddenInput = fragmentElement.querySelector('input[type="hidden"]');
	const table = fragmentElement.querySelector('.repeater-grid');
	const tableHead = table.querySelector('thead');
	const tableBody = table.querySelector('tbody');
	const addButton = fragmentElement.querySelector('.add-repeater-item-btn');

	let fieldStructure = [];
	const picklistCache = new Map();
	const PICKLIST_API_PREFIX = '/o/headless-admin-list-type/v1.0/list-type-definitions/by-external-reference-code/';
	const PICKLIST_API_SUFFIX = '/list-type-entries';

	/**
	 * Parses the field structure from the configuration.
	 * Handles potential JSON parsing errors.
	 */
	function parseFieldStructure() {
		try {
			fieldStructure = JSON.parse(configuration.fieldStructure);
			if (!Array.isArray(fieldStructure)) {
				console.error('Repeater field structure must be a JSON array.');
				fieldStructure = [];
			}
		} catch (e) {
			console.error('Invalid JSON in fieldStructure configuration:', e);
			fieldStructure = [];
		}
	}

	/**
	 * Fetches picklist data from a Liferay API endpoint.
	 * Caches the results to avoid repeated API calls.
	 * @param {string} erc The External Reference Code of the picklist.
	 * @returns {Promise<Array>} A promise that resolves to an array of options.
	 */
	async function getPicklistOptions(erc) {
		if (!erc) {
			return [];
		}

		if (picklistCache.has(erc)) {
			return picklistCache.get(erc);
		}

		const endpoint = `${PICKLIST_API_PREFIX}${erc}${PICKLIST_API_SUFFIX}`;

		try {
			// Use Liferay.Util.fetch which includes authentication headers automatically.
			const response = await Liferay.Util.fetch(endpoint);
			const jsonResponse = await response.json();

			const data = jsonResponse.items.map(item => ({
				label: item.name,
				value: item.key, // Using 'key' as the value is standard for picklists
			}));

			picklistCache.set(erc, data);
			return data;
		} catch (error) {
			console.error(`Failed to fetch picklist from ${endpoint}:`, error);
			picklistCache.set(erc, []); // Cache empty array on failure
			return [];
		}
	}

	/**
	 * Creates an input element based on the field definition.
	 */
	async function createFieldInput(field, value) {
		let input;
		if (field.type === 'select') {
			input = document.createElement('select');
			const erc = field.name === 'type' ? configuration.typePicklistERC : configuration.subTypePicklistERC;
			const options = await getPicklistOptions(erc);

			options.forEach(option => {
				const opt = document.createElement('option');
				opt.value = option.value;
				opt.textContent = option.label;
				if (option.value === value) {
					opt.selected = true;
				}
				input.appendChild(opt);
			});
		} else {
			input = document.createElement('input');
			input.type = field.type || 'text';
			input.value = value || '';
		}
		input.name = field.name;
		input.className = 'form-control';
		return input;
	}

	/**
	 * Toggles a row between display and edit mode.
	 */
	async function toggleEdit(row, isEditing) {
		const cells = row.querySelectorAll('td:not(.actions-cell)');
		const data = getRowData(row);

		for (let i = 0; i < cells.length; i++) {
			const cell = cells[i];
			const index = i;
			const field = fieldStructure[index];
			cell.innerHTML = ''; // Clear the cell

			if (isEditing) {
				const input = await createFieldInput(field, data[field.name]);
				cell.appendChild(input);
			} else {
				const erc = field.name === 'type' ? configuration.typePicklistERC : configuration.subTypePicklistERC;
				let displayValue = data[field.name];
				if (field.type === 'select') {
					const options = await getPicklistOptions(erc);
					const selectedOption = options.find(opt => opt.value === displayValue);
					displayValue = selectedOption ? selectedOption.label : displayValue;
				}
				cell.textContent = displayValue;
			}
		}

		renderActions(row, isEditing);
	}

	/**
	 * Renders the action buttons (Edit, Remove, Save, Cancel) for a row.
	 */
	function renderActions(row, isEditing) {
		const actionsCell = row.querySelector('.actions-cell');
		actionsCell.innerHTML = '';

		if (isEditing) {
			const saveButton = document.createElement('button');
			saveButton.type = 'button';
			saveButton.className = 'btn btn-primary btn-sm';
			saveButton.textContent = 'Save';
			saveButton.onclick = () => {
				const inputs = row.querySelectorAll('.form-control');
				const newData = {};
				inputs.forEach(input => {
					newData[input.name] = input.value;
				});
				setRowData(row, newData);
				toggleEdit(row, false);
				updateHiddenInput();
			};

			const cancelButton = document.createElement('button');
			cancelButton.type = 'button';
			cancelButton.className = 'btn btn-secondary btn-sm';
			cancelButton.textContent = 'Cancel';
			cancelButton.onclick = () => {
				// If it's a new row (has no data), remove it on cancel.
				if (!row.dataset.rowData) {
					row.remove();
				} else {
					toggleEdit(row, false);
				}
				updateHiddenInput();
			};

			actionsCell.appendChild(saveButton);
			actionsCell.appendChild(cancelButton);
		} else {
			const editButton = document.createElement('button');
			editButton.type = 'button';
			editButton.className = 'btn btn-secondary btn-sm';
			editButton.textContent = 'Edit';
			editButton.onclick = () => toggleEdit(row, true);

			const removeButton = document.createElement('button');
			removeButton.type = 'button';
			removeButton.className = 'btn btn-danger btn-sm';
			removeButton.textContent = 'Remove';
			removeButton.onclick = () => {
				row.remove();
				updateHiddenInput();
			};

			actionsCell.appendChild(editButton);
			actionsCell.appendChild(removeButton);
		}
	}

	/**
	 * Creates a new table row.
	 * @param {object} [data] - Optional data to pre-fill the row.
	 */
	function createRow(data) {
		const row = tableBody.insertRow();
		setRowData(row, data || {});

		fieldStructure.forEach(field => {
			row.insertCell();
		});

		const actionsCell = row.insertCell();
		actionsCell.className = 'actions-cell';

		// If data is provided, start in display mode. Otherwise, start in edit mode.
		toggleEdit(row, !data);

		return row;
	}

	/**
	 * Reads data from all visible rows and updates the hidden input with the JSON string.
	 */
	function updateHiddenInput() {
		const allRows = tableBody.querySelectorAll('tr');
		const data = [];

		allRows.forEach(row => {
			// Only include rows that are not in edit mode for a new item
			if (row.dataset.rowData) {
				data.push(getRowData(row));
			}
		});

		hiddenInput.value = JSON.stringify(data, null, 2);
	}

	/**
	 * Adds a new, empty row to the container.
	 */
	function addNewRow() {
		createRow(null); // Create a row without data to start in edit mode
		updateHiddenInput();
	}

	/**
	 * Prefills the repeater with initial data from the configuration.
	 */
	function prefill() {
		if (!configuration.prefillData) {
			return;
		}

		try {
			const prefillData = JSON.parse(configuration.prefillData);
			if (Array.isArray(prefillData)) {
				prefillData.forEach(dataItem => createRow(dataItem));
			}
		} catch (e) {
			console.error('Invalid JSON in prefillData configuration:', e);
		}
	}

	/**
	 * Helper functions to store and retrieve row data using dataset attributes.
	 */
	function setRowData(row, data) {
		row.dataset.rowData = JSON.stringify(data);
	}

	function getRowData(row) {
		return JSON.parse(row.dataset.rowData || '{}');
	}

	/**
	 * Generates the table headers from the field structure.
	 */
	function renderHeaders() {
		const headerRow = tableHead.insertRow();
		fieldStructure.forEach(field => {
			const th = document.createElement('th');
			th.textContent = field.label;
			headerRow.appendChild(th);
		});
		const th = document.createElement('th');
		th.textContent = 'Actions';
		headerRow.appendChild(th);
	}

	/**
	 * Initializes the fragment.
	 */
	async function init() {
		if (!hiddenInput || !table || !addButton) {
			console.error('Repeater fragment is missing required elements.');
			return;
		}

		parseFieldStructure();
		if (fieldStructure.length === 0) {
			addButton.style.display = 'none';
			return;
		}

		// Pre-fetch picklist data on initialization for better performance
		if (configuration.typePicklistERC) {
			await getPicklistOptions(configuration.typePicklistERC);
		}
		if (configuration.subTypePicklistERC) {
			await getPicklistOptions(configuration.subTypePicklistERC);
		}

		renderHeaders();
		prefill();
		updateHiddenInput();

		addButton.addEventListener('click', addNewRow);
	}

	init();
}

JsonRepeaterField(fragmentElement, configuration);
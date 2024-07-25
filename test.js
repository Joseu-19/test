import users from './results.json' with {type: 'json'};
const computers = users;

// Set to store the identifiers of the created nodes
const createdNodes = new Set();

let listContainer = document.querySelector("#computerListWrapper");
let btn = document.querySelector("#addpcBtn").addEventListener("click", () => {
    computerList();
});

function computerList() {
    listContainer.style.display = listContainer.style.display === 'block' ? 'none' : 'block';
}

// Collapsible menu
document.addEventListener('click', (event) => {
    if (!listContainer.contains(event.target) && !event.target.matches('#addpcBtn')) {
        listContainer.style.display = 'none';
    }
});

listContainer.innerHTML = ' ';

// Function to create a computer element
function createComputerElement(computer) {
    let computerObject = document.createElement('li');
    computerObject.style.width = '100%';
    let computerName = document.createElement('h4');
    let computerState = document.createElement('h6');
    let networkType = document.createElement('h6');
    networkType.classList.add('networkType');
    computerState.classList.add('statusTag');
    let computerIP = document.createElement('p');

    computerName.textContent = `Name: ${computer.Name}`;
    computerState.textContent = `${computer.State}`;
    computerIP.textContent = `IP: ${computer.IPAddress}`;

    if (computer.State === 'On') {
        switch (computer.IPAddress.split('.')[2]) {
            case "110":
                networkType.textContent = 'Hot Spot';
                break;
            case "15":
                networkType.textContent = 'VPN';
                break;
            case "10":
                networkType.textContent = 'Local';
                break;
            default:
                networkType.textContent = 'Unknown';
        }
        computerObject.appendChild(networkType);
    }

    computerObject.appendChild(computerName);
    computerObject.appendChild(computerState);
    computerObject.appendChild(computerIP);

    if (computer.IPAddress === null) {
        computerIP.textContent = 'Unable to ping :(';
    }

    return computerObject;
}

// Load computers and create their elements
computers.forEach((computer) => {
    let computerObject = createComputerElement(computer);
    computerObject.addEventListener('click', () => {
        createDraggableNode(computer);
    });
    listContainer.appendChild(computerObject);
});

// Function to create a draggable node
async function createDraggableNode(computer) {
    if (!createdNodes.has(computer.Name)) {
        let dot = document.createElement('div');
        dot.classList.add('draggable-dots');
        dot.style.zIndex = '99';
        dot.dataset.name = computer.Name;
        
        if (computer.State === 'On') {
            switch (computer.IPAddress.split('.')[2]) {
                case '110':
                    dot.classList.add('yellow_indicator'); // hotspot
                    break;
                case '15':
                    dot.classList.add('blue_indicator'); // vpn
                    break;
                default:
                    dot.classList.add('green_indicator');
            }
        } else {
            dot.classList.add('red_indicator');
        }

        // Create and append the pop-up
        let popUp = createPopUp(computer);
        document.body.appendChild(popUp);

        // Variables to track dragging state and offsets
        let offsetX = 0, offsetY = 0, isDragging = false;

        dot.addEventListener('mousedown', (e) => {
            isDragging = true;
            offsetX = e.clientX - dot.getBoundingClientRect().left;
            offsetY = e.clientY - dot.getBoundingClientRect().top;
            dot.style.cursor = 'grabbing';
        });

        // Toggle pop-up visibility
        popUp.style.display = 'none';
        dot.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            popUp.style.display = 'block';
        });

        // Prevent page resizing with Ctrl + Mouse Wheel
        document.addEventListener('wheel', (e) => {
            if (e.ctrlKey) {
                e.preventDefault();
            }
        }, { passive: false });

        // Hide pop-up when clicking outside
        document.addEventListener('click', (event) => {
            if (!popUp.contains(event.target) && !event.target.matches('popUp')) {
                popUp.style.display = 'none';
            }
        });

        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                const mapArea = document.querySelector('.mapArea').getBoundingClientRect();
                const newX = e.pageX - offsetX;
                const newY = e.pageY - offsetY;

                // Check if new position is within mapArea bounds
                if (newX >= mapArea.left && newX <= mapArea.right - dot.clientWidth &&
                    newY >= mapArea.top && newY <= mapArea.bottom - dot.clientHeight) {
                    dot.style.left = newX + 'px';
                    dot.style.top = newY + 'px';
                    popUp.style.left = newX - 105 + 'px';
                    popUp.style.top = newY - 150 + 'px';
                }
            }
        });

        document.addEventListener('mouseup', async () => {
            if (isDragging) {
                isDragging = false;
                popUp.style.display = 'none';
                await saveNodeState(computer.Name, dot.style.left, dot.style.top);
            }
            dot.style.cursor = 'grab';
        });

        // Restore position if previously saved
        const savedNode = await getNodeState(computer.Name);
        if (savedNode) {
            dot.style.left = savedNode.left;
            dot.style.top = savedNode.top;
        }

        document.body.appendChild(dot);
        createdNodes.add(computer.Name);
    } else {
        alert(computer.Name + " already on map.");
    }
}

async function saveNodeState(name, left, top) {
    try {
        await fetch('http://localhost:8090/api/computers', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, xcord: parseFloat(left), ycord: parseFloat(top) })
        });
    } catch (error) {
        console.error('Error saving node state:', error);
    }
}

async function getNodeState(name) {
    try {
        let response = await fetch(`http://localhost:8090/api/computers/${name}`);
        let node = await response.json();
        return node;
    } catch (error) {
        console.error('Error fetching node state:', error);
    }
}

function createPopUp(computer) {
    let popUp = document.createElement('span');
    popUp.classList.add('popUp');
    updatePopUpContent(popUp, computer);

    return popUp;
}

function updatePopUpContent(popUp, computer) {
    popUp.innerHTML = ''; // Clear existing content
    const computerObject = createComputerElement(computer);
    Array.from(computerObject.childNodes).forEach(child => {
        let clonedChild = child.cloneNode(true);
        popUp.appendChild(clonedChild);
    });

    // Append the delete element to the pop-up
    let deleteElement = document.createElement('p');
    deleteElement.textContent = 'Delete';
    deleteElement.classList.add('edit_text');
    popUp.appendChild(deleteElement);

    // Add event listener to the delete element for node removal
    deleteElement.addEventListener('click', () => {
        let confirmation = confirm('Are you sure you want to delete this node? ' + computer.Name);
        if (confirmation) {
            removeActiveNodes(computer);
            popUp.remove();
        } else {
            alert('Deletion cancelled');
            popUp.style.display = 'none';
        }
    });
}

// Function to remove active nodes
async function removeActiveNodes(computer) {
    // Find the node in the DOM
    const dot = document.querySelector(`div[data-name="${computer.Name}"]`);
    if (dot) {
        // Remove the node from the DOM
        dot.remove();
    }

    // Remove the node from the createdNodes set
    createdNodes.delete(computer.Name);

    // Also remove from the database
    try {
        await fetch(`http://localhost:8090/api/computers/${computer.Name}`, { method: 'DELETE' });
    } catch (error) {
        console.error('Error removing node from database:', error);
    }
}

// Load computers from the database and create their elements
async function loadComputers() {
    try {
        let response = await fetch('http://localhost:8090/api/computers');
        let computers = await response.json();
        computers.forEach((computer) => {
            createDraggableNode(computer);
        });
    } catch (error) {
        console.error('Error loading computers:', error);
    }
}

// Call the function to load computers on page load
loadComputers();

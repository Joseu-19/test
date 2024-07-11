import users from './results.json' with {type: 'json'};
const computers = users;

let listContainer = document.querySelector("#computerListWrapper");
let btn = document.querySelector("#addpcBtn").addEventListener("click", () => {
    computerList();
});

function computerList() {
    if (listContainer.style.display === 'block') {
        listContainer.style.display = 'none';
    } else {
        listContainer.style.display = 'block';
    }
}

// Collapsible menu
document.addEventListener('click', (event) => {
    // Check if the click is outside of the list container
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

    if (computer.State === 'On' && computer.IPAddress.split('.')[2] === "110") {
        networkType.textContent = 'Hot Spot';
        computerObject.appendChild(networkType);
    } else if (computer.State === 'On' && computer.IPAddress.split('.')[2] === "15") {
        networkType.textContent = 'VPN';
        computerObject.appendChild(networkType);
    } else if (computer.State === 'On' && computer.IPAddress.split('.')[2] === "10") {
        networkType.textContent = 'Local';
        computerObject.appendChild(networkType);
    }

    computerObject.appendChild(computerName);
    computerObject.appendChild(computerState);
    computerObject.appendChild(computerIP);
    

    // What if the IP Value is null?
    if (computer.IPAddress === null) {
        console.log('null');
        computerIP.textContent = 'Unable to ping :(';
        computerObject.appendChild(computerIP);
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
function createDraggableNode(computer) {
    if (!createdNodes.has(computer.Name)) {
        let dot = document.createElement('div');
        dot.classList.add('draggable-dots');
        dot.style.zIndex = '1';
        dot.dataset.name = computer.Name;
        
        if(computer.State === 'On'){
            if(computer.IPAddress.split('.')[2] === '110' ){
                dot.classList.add('yellow_indicator'); //hotspot
            }
            else if(computer.IPAddress.split('.')[2] === '15'){
                dot.classList.add('blue_indicator'); // vpn
            }
            else{
                dot.classList.add('green_indicator');
            }
        }
        else{
            dot.classList.add('red_indicator');
        }

        // Create and append the pop-up
        let popUp = createPopUp(computer);
        document.body.appendChild(popUp);

        // Variables to track dragging state and offsets
        let offsetX = 0, offsetY = 0, isDragging = false;

        // Event listener for mousedown to start dragging
        dot.addEventListener('mousedown', (e) => {
            isDragging = true;
            offsetX = e.clientX - dot.getBoundingClientRect().left;
            offsetY = e.clientY - dot.getBoundingClientRect().top;

            dot.style.cursor = 'grabbing';
        });
        // toggle pop up
        popUp.style.display  = 'none';
        dot.addEventListener('contextmenu', (e)=>{
            e.preventDefault();
            popUp.style.display = 'block'
        });

        //prevents page resizing
        document.addEventListener('wheel', (e) => {
            if (e.ctrlKey) {
                console.log('trying to resize')
                e.preventDefault();
            }
        },
        //what does this mean
         { passive: false });

         //#######################################

         document.addEventListener('click', (event) => {
            // Check if the click is outside of the list container
            if (!popUp.contains(event.target) && !event.target.matches('popUp')) {
                popUp.style.display = 'none';
            }
        });
        
        // Event listener for mousemove to handle dragging
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

        // Event listener for mouseup to stop dragging
        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                popUp.style.display = 'none';
                saveNodeState(computer.Name, dot.style.left, dot.style.top);
            }

            dot.style.cursor = 'grab';
        });

        // Restore position if previously saved
        const savedNode = getNodeState(computer.Name);
        if (savedNode) {
            dot.style.left = savedNode.left;
            dot.style.top = savedNode.top;
        }

        document.body.appendChild(dot);
        createdNodes.add(computer.Name);
        saveCreatedNodes();
    } else {
        alert(computer.Name + " already on map.");
    }
}

function saveNodeState(name, left, top) {
    const nodeStates = JSON.parse(localStorage.getItem('nodeStates')) || {};
    nodeStates[name] = { left, top };
    localStorage.setItem('nodeStates', JSON.stringify(nodeStates));
}

function getNodeState(name) {
    const nodeStates = JSON.parse(localStorage.getItem('nodeStates')) || {};
    return nodeStates[name] || null;
}

function createPopUp(computer) {
    let popUp = document.createElement('span');
    popUp.classList.add('popUp');
    updatePopUpContent(popUp, computer);
    popUp.appendChild(edit);
    return popUp;
}

// This function updates the content on the pop ups.
let edit = document.createElement('p');
    edit.textContent = 'Edit';
    edit.classList.add('edit_text');

function updatePopUpContent(popUp, computer) {
    popUp.innerHTML = ''; // Clear existing content
    const computerObject = createComputerElement(computer);
    Array.from(computerObject.childNodes).forEach(child => {
        let clonedChild = child.cloneNode(true);
        popUp.appendChild(clonedChild);
        popUp.appendChild(edit);
    });
}

// Save created nodes in local storage
function saveCreatedNodes() {
    localStorage.setItem('createdNodes', JSON.stringify([...createdNodes]));
}

// Load created nodes from local storage and recreate them
function loadCreatedNodes() {
    const savedNodes = JSON.parse(localStorage.getItem('createdNodes')) || [];
    savedNodes.forEach(name => {
        const computer = computers.find(c => c.Name === name);
        if (computer) {
            createDraggableNode(computer);
        }
    });
}

// Set to store the identifiers of the created nodes
const createdNodes = new Set();

// Call the function to load created nodes on page load
loadCreatedNodes();

//################################################

//remove nodes

function removeActiveNodes(activeNodes){

}

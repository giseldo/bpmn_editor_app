var BpmnModeler = window.BpmnJS;

var bpmnModeler = new BpmnModeler({
  container: '#canvas'
});

var diagramXML = '<?xml version="1.0" encoding="UTF-8"?>\n<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" id="Definitions_1" targetNamespace="http://bpmn.io/schema/bpmn" exporter="bpmn-js" exporterVersion="11.0.0">\n  <bpmn:process id="Process_1" isExecutable="false">\n    <bpmn:startEvent id="StartEvent_1" />\n  </bpmn:process>\n  <bpmndi:BPMNDiagram id="BPMNDiagram_1">\n    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">\n      <bpmndi:BPMNShape id="_BPMNShape_StartEvent_2" bpmnElement="StartEvent_1">\n        <dc:Bounds x="179" y="159" width="36" height="36" />\n      </bpmndi:BPMNShape>\n    </bpmndi:BPMNPlane>\n  </bpmndi:BPMNDiagram>\n</bpmn:definitions>';

bpmnModeler.importXML(diagramXML, function(err) {

  if (err) {
    return console.error('could not import BPMN 2.0 diagram', err);
  }

  var canvas = bpmnModeler.get('canvas');
  canvas.zoom('fit-viewport');

});

const chatInput = document.getElementById('chat-input');
const sendButton = document.getElementById('send-button');
const chatOutput = document.getElementById('chat-output');

function appendMessage(sender, message) {
    const p = document.createElement('p');
    p.textContent = `${sender}: ${message}`;
    chatOutput.appendChild(p);
    chatOutput.scrollTop = chatOutput.scrollHeight;
}

sendButton.addEventListener('click', sendMessage);
chatInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

async function sendMessage() {
    const command = chatInput.value.trim();
    if (!command) return;

    appendMessage('Você', command);
    chatInput.value = '';

    try {
        const response = await fetch('/process_command', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ command: command })
        });
        const data = await response.json();
        appendMessage('Bot', data.message);
        handleCommandResponse(data.action);

    } catch (error) {
        console.error('Erro ao enviar comando:', error);
        appendMessage('Bot', 'Desculpe, houve um erro ao processar seu comando.');
    }
}

function handleCommandResponse(action) {
    const modeling = bpmnModeler.get('modeling');
    const elementFactory = bpmnModeler.get('elementFactory');
    const canvas = bpmnModeler.get('canvas');
    const rootElement = canvas.getRootElement();

    if (action && action.type === 'create_element') {
        const { elementType, x, y, name } = action;
        const newElement = elementFactory.createShape({
            type: elementType
        });

        modeling.createShape(newElement, { x: x, y: y }, rootElement);
        if (name) {
            modeling.updateLabel(newElement, name);
        }
        canvas.zoom('fit-viewport');
    } else if (action && action.type === 'create_connection') {
        const { sourceId, targetId, name } = action;
        const source = bpmnModeler.get('elementRegistry').get(sourceId);
        const target = bpmnModeler.get('elementRegistry').get(targetId);

        if (source && target) {
            const newConnection = elementFactory.createConnection({
                type: 'bpmn:SequenceFlow'
            });
            modeling.connect(source, target, newConnection);
            if (name) {
                modeling.updateLabel(newConnection, name);
            }
            canvas.zoom('fit-viewport');
        } else {
            appendMessage('Bot', 'Não consegui encontrar os elementos de origem ou destino para criar a conexão.');
        }
    }
    // Adicione mais tipos de ações aqui conforme necessário
}
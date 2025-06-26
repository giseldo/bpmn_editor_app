from flask import Flask, render_template, send_from_directory, request, jsonify

app = Flask(__name__, static_folder='static', template_folder='static')

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/<path:filename>')
def static_files(filename):
    return send_from_directory(app.template_folder, filename)

@app.route('/process_command', methods=['POST'])
def process_command():
    data = request.get_json()
    command = data.get('command', '').lower()

    action = None
    message = "Comando não reconhecido. Tente 'criar tarefa', 'criar evento' ou 'criar gateway'."

    if "criar tarefa" in command:
        task_name = command.replace("criar tarefa", "").strip()
        if not task_name:
            task_name = "Nova Tarefa"
        action = {
            'type': 'create_element',
            'elementType': 'bpmn:Task',
            'x': 300,  # Posição X arbitrária
            'y': 200,  # Posição Y arbitrária
            'name': task_name.title()
        }
        message = f"Tarefa '{task_name.title()}' criada com sucesso."
    elif "criar evento" in command:
        event_name = command.replace("criar evento", "").strip()
        if not event_name:
            event_name = "Novo Evento"
        action = {
            'type': 'create_element',
            'elementType': 'bpmn:StartEvent',
            'x': 100,
            'y': 200,
            'name': event_name.title()
        }
        message = f"Evento '{event_name.title()}' criado com sucesso."
    elif "criar gateway" in command:
        gateway_name = command.replace("criar gateway", "").strip()
        if not gateway_name:
            gateway_name = "Novo Gateway"
        action = {
            'type': 'create_element',
            'elementType': 'bpmn:ExclusiveGateway',
            'x': 500,
            'y': 200,
            'name': gateway_name.title()
        }
        message = f"Gateway '{gateway_name.title()}' criado com sucesso."
    elif "conectar" in command and "com" in command:
        parts = command.split("conectar ")[1].split(" com ")
        if len(parts) == 2:
            source_name = parts[0].strip()
            target_name = parts[1].strip()
            # No momento, o backend não tem acesso direto aos IDs dos elementos no frontend.
            # Isso exigiria uma lógica mais complexa para mapear nomes para IDs.
            # Por enquanto, vamos retornar uma mensagem informativa.
            message = f"Para conectar, preciso dos IDs dos elementos. Por exemplo: 'conectar elemento_id_1 com elemento_id_2'."
        else:
            message = "Formato de conexão inválido. Use 'conectar [nome_origem] com [nome_destino]'."

    return jsonify({'message': message, 'action': action})

if __name__ == '__main__':
    app.run(debug=True)
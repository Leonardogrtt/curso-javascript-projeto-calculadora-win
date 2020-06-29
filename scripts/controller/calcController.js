class calcController {

    //metodo construtor

    constructor(){

        this._operation = []

        this._lastNumber
        this._lastOperation

        this._displayCalcEl = document.querySelector("#display") //display da calculadora

        this.initialize()
        this.initButtonEvents()
        this.initKeyboardEvents()

    }

    //metodo de inicialização
    initialize(){

        //zera o display e o vetor
        this.clearAll()

        //cria escuta para evento 'paste' (colar)
        this.pasteFromClipboard()

    }

    //metodo: limpa o vetor de operações
    clearAll(){
        this._operation = []
        this._lastNumber = ''
        this._lastOperation = ''
        this.displayCalc = 0
    }

    //metodo: limpa a ultima entrada do vetor de operações
    clearEntry(){
        this._operation.pop()
    }

    //metodo: retorna ultima operação do vetor de operações
    getLastItem(){
        return this._operation[this._operation.length - 1]
    }

    //metodo: modifica ultimo item do vetor de operações
    setLastItem(value){
        this._operation[this._operation.length - 1] = value
    }

    //metodo: retorna true se value for um numero
    isNumber(value){       
        return !isNaN(value)
    }

    //metodo: retorna true, se a entrada é um operador matemático
    isOperator(value){
        return (['+', '-', '*', '/', '%', 'X', '÷'].indexOf(value) > -1)
    }

    //metodo: guarda ultimo numero inserido
    saveAsLastNumber(value){
        this._lastNumber = value
    }

    //metodo: guarda ultima operação inserida
    saveAsLastOperation(value){
        this._lastOperation = value
    }

    //metodo: verifica se o vetor de operações não está vazio
    notEmpty(){

        if(this._operation.length) {
            return true
        } else {
            return false
        }
    }

    //metodo: imprime mensagem de erro e zera calculadora
    setError(){
        this.clearAll()
        this.displayCalc = "Error"
    }

    //metodo: cria escuta para evento que cola conteudo da área de transferência para o display
    pasteFromClipboard(){
        document.addEventListener('paste', e => {
            let text = e.clipboardData.getData('Text')
            this.displayCalc = parseFloat(text)
            this.pushNumber(this.displayCalc)
        })
    }

    //metodo: copia numero que esta no display para a área de transferência
    copyToClipboard(){

        //criar elemento input
        let input = document.createElement('input')

        //colocar valor dentro do input
        input.value = this.displayCalc

        //inserir input dentro do body
        document.body.appendChild(input)

        //selecionar conteudo do input
        input.select()

        //copiar informação para o sistema operacional
        document.execCommand("Copy")

        //deletar input
        input.remove()
    }

    //metodo: adiciona listeners em um determinado elemento, para cada evento escolhido
    addEventListenerAll(element, events, fn){
        events.split(" ").forEach(event => {
            element.addEventListener(event, fn)
        })
    }

    //metodo: inicializa botões da página
    initButtonEvents(){

        //guarda todos botoes em buttons[]
        let buttons = document.querySelectorAll("button")

        //console.log(buttons)

        //para cada elemento de buttons[] selecionado adicionar listeners de eventos
        buttons.forEach((btn) => {

            this.addEventListenerAll(btn, 'click drag', e => {

                //funcao disparada pelo evento

                if(btn.className == 'btn btn-number col-sm') {

                    //console.log(btn.firstChild.nodeValue)

                    let btnPressed = btn.firstChild.nodeValue

                    this.pushNumber(btnPressed)

                } else if(btn.className == 'btn btn-others col-sm') {
                    
                    //console.log(btn.firstChild.nodeValue)

                    let btnPressed = btn.firstChild.nodeValue

                    if(this.isOperator(btnPressed)) {
                        if(btnPressed == '÷') btnPressed = '/'
                        if(btnPressed == 'X') btnPressed = '*'

                        this.pushOperator(btnPressed)
                    } else {
                        // = , +- <- C CE % raiz quadrado 1/x
                        this.pushOther(btnPressed)
                    }
                }
            })

            this.addEventListenerAll(btn, 'mouseover mouseup mousedown', e => {
                btn.style.cursor = "pointer"
            })

        })

    }

    //metodo: inicializa eventos de teclado
    initKeyboardEvents(){

        document.addEventListener('keyup', e => {

            switch (e.key) {

                case 'Escape':
                    this.clearAll()
                    break;
                case 'Backspace':
                    this.clearEntry()
                    break;
                case '+':
                case '-':
                case '*':
                case '/':
                case '%':
                    this.pushOperator(e.key)
                    break;
                case ',':
                    this.pushDot()
                    break;
                case '.':
                    this.pushDot()
                    break;
                case 'Enter':
                    this.fastCalc()
                    break;
                case '=':
                    this.fastCalc()
                    break;
                case '0':
                case '1':
                case '2':
                case '3':
                case '4':
                case '5':
                case '6':
                case '7':
                case '8':
                case '9':
                    this.pushNumber(parseInt(e.key))
                    break;
                case 'c':
                    if(e.ctrlKey) {
                        //ctrl + c
                        this.copyToClipboard()
                    }
                    break;

            }

        })

    }

    //2 metodo: insere numero no vetor
    pushNumber(value){

        if(this.notEmpty()) {
            //vetor não vazio

            let last = this.getLastItem()
            if(this.isNumber(last)) {
                console.log(last)

                let dotIndex = (last.toString()).indexOf('.')
                if(dotIndex > -1) {

                    //console.log('float')
                    value = last.toString() + value.toString()
                    this.setLastItem(value)

                } else {

                    //console.log('int')
                    if(last == '0') {
                        this.setLastItem(value)
                    } else {
                        value = last.toString() + value.toString()
                        this.setLastItem(value)
                    }
                }
            } else {
                this._operation.push(value)
            }
            this.saveAsLastNumber(value)
            this.setLastNumberToDisplay()

        } else { 
            //vetor vazio
            this.saveAsLastNumber(value)
            this._operation.push(value)
            this.setFirstNumberToDisplay()
        }
    }

    //2 metodo: insere operador no vetor, verificando se há necessidade de calcular
    pushOperator(value){

        if(this.notEmpty()) {
            //vetor não vazio

            let last = this.getLastItem()

            if(this.isOperator(last)) { //caso ultimo seja operador
    
                this.setLastItem(value)
    
            }else if(this.isNumber(last)) { //caso ultimo seja numero

                this._operation.push(value)
                this.checkForCalc()

            }

            this.saveAsLastOperation(value)

        } else {
            //vetor vazio
            this.saveAsLastOperation(value)
            this._operation.push(value)
        }
    }

    //2 metodo: executa funções dos outros botões
    pushOther(value){

        // = , +- <- C CE % raiz quadrado 1/x

        switch (value) {
            case '=':
                this.fastCalc()
                break;
            case '√':
                //raiz quadrada
                this.calcSqrRoot()
                break;
            case 'x²':
                //ao quadrado
                this.calcSquared()
                break;
            case '¹/x':
                //inverso
                this.calcInverse()
                break;
            case 'C':
                this.clearAll()
                break;
            case '←':
                this.clearEntry()
                break;
            case 'CE':
                this.clearEntry()
                break;
            case '±':
                //mais menos, implementar
                console.log('mais menos')
                break;
            case ',':
                this.pushDot()
                break;
            case '.':
                this.pushDot()
                break;
        }

    }

    //2 metodo: insere ponto no ultimo numero do vetor
    pushDot(){

        if(this.notEmpty()) {
            
            let last = this.getLastItem()
            
            if(typeof last === 'string' && last.split('').indexOf('.') > -1) return
                
            if(this.isNumber(last)) {
                //ultimo é numero
                this.setLastItem(last.toString() + '.')
                this.setLastNumberToDisplay()

            } else {
                //ultimo é operador
                this._operation.push('0.')

                this.setLastNumberToDisplay()
            }

        } else {
            //vazio

            this._operation.push('0.')

            this.setLastNumberToDisplay()

        }

    }

    //metodo: calcula a raiz quadrada do valor do display
    calcSqrRoot(){

        let last = this.getLastItem()

        if(this.isNumber(last)) {
            
            this.setLastItem(Math.sqrt(last))

            this.setLastNumberToDisplay()

        }

    }

    //metodo: calcula o quadrado do valor do display
    calcSquared(){

        let last = this.getLastItem()

        if(this.isNumber(last)) {
            
            this.setLastItem(Math.pow(last, 2))

            this.setLastNumberToDisplay()

        }

    }

    //metodo: calcula o inverso do valor do display
    calcInverse(){

        let last = this.getLastItem()

        if(this.isNumber(last)) {
            let newValue = 1 / last
            this.setLastItem(newValue)
            this.setLastNumberToDisplay()
        }

    }

    //3 metodo: verifica efetivamente se há necessidade de efetuar cálculo
    checkForCalc(){

        if(this._operation.length > 3) {
            this.forceCalc()
        }
    }

    //4 metodo: recebe o vetor com 4 elementos e faz o calculo e rearranjo dos elementos
    forceCalc(){
        //metodo para estouro do vetor com operações
        //4 itens no vetor
        
        let temp = this._operation.pop()
        this._lastOperation = temp
        let result

        result = eval(this._operation.join(""))

        if(temp == '%') {

            result /= 100
            this._operation = [result]

        } else {
            this._operation = [result]
        }

        this.setLastNumberToDisplay()

    }

    //5 metodo: calculo executado pelo usuário, ao aperta o botão de 'igual'
    //trata casos em que há apenas 2 elementos no vetor, como '2 +'
    fastCalc(){

        let size = this._operation.length
        let last = this.getLastItem()

        switch (size) {
            case 0:
                break;
            case 1:
                if(this.isNumber(last)) {
                    if(this._lastOperation) {
                        this._operation.push(this._lastOperation)
                        this._operation.push(this._lastNumber)
                        this.fastCalc()
                    }
                }
                break;
            case 2:
                if(last != '%') {
                    this._operation.push(this._lastNumber)
                    this.fastCalc()
                }
                break;

            case 3:
                this.pushOperator(this._lastOperation)
                break;

            default:
                this.setError()
                break;

        }

    }

    //6 metodo: mostra numero atualizado no display da calculadora
    setLastNumberToDisplay(){

        if(this.notEmpty()) {
            //vetor não vazio

            let last

            for(let index in this._operation) {
                if(this.isNumber(this._operation[index])) {
                    last = this._operation[index].toString()
                }
            }            

            this.displayCalc = last

        } else {
            //vetor vazio
            this.displayCalc = '0'
        }
    }

    //metodo: pega o unico número que está no vetor e mostra no display
    setFirstNumberToDisplay(){
        this.displayCalc = this._operation[0]
    }

    //amarrando elementos da página html, com as propriedades get e set da Classe:

    //propriedade: retorna conteúdo no display da calculadora
    get displayCalc(){
        return this._displayCalcEl.innerHTML
    }

    //propriedade: seta conteúdo no display da calculadora, se for mais que 10 digitos gera erro
    set displayCalc(value){
        
        if(value.length > 10) {

            let dotIndex = value.indexOf('.')
            if(dotIndex > -1) {
                //racional com mais de 9 dígitos numéricos

                //aqui estou fixando o ponto decimal de maneira dinâmica:

                    //se o ponto está nas primeira posições, 
                        //significa que haverão mais casas decimais disponíveis 
                    //se o ponto estiver no final do número
                        //haverão mais dígitos inteiros disponíveis

                let invDotIndex = 9 - dotIndex
                value = parseFloat(value).toFixed(invDotIndex)
                value = value.toString()

            } else {
                //inteiro com mais de 10 dígitos numéricos
                this.setError()
                return false
            }
        }
        this._displayCalcEl.innerHTML = value
    }

}

class RecintosZoo {
    constructor() {
        this.bioma = [];
        this.animaisValidos = [];
        this.inicializador();
    }

    adicionaBioma(numeroX, biomaX, tamanhoX, animaisX) {
        this.bioma.push({numero: numeroX, bioma: biomaX, tamanho: tamanhoX, animais: animaisX});
    }

    adicionaAnimal(animalX, tamanhoX, biomaX, carnivoroX) {
        this.animaisValidos.push({animal: animalX, tamanho: tamanhoX, bioma: biomaX, carnivoro: carnivoroX});
    }

    // Inicializador dos biomas e animais disponiveis
    inicializador() {
        this.adicionaBioma(1, ['savana'], 10, [{animal: 'MACACO', quantidade: 3}]);
        this.adicionaBioma(2, ['floresta'], 5, []);
        this.adicionaBioma(3, ['savana', 'rio'], 7, [{animal: 'GAZELA', quantidade: 1}]);
        this.adicionaBioma(4, ['rio'], 8, []);
        this.adicionaBioma(5, ['savana'], 9, [{animal: 'LEAO', quantidade: 1}]);

        this.adicionaAnimal('LEAO', 3, ['savana'], true);
        this.adicionaAnimal('LEOPARDO', 2, ['savana'], true);
        this.adicionaAnimal('CROCODILO', 3, ['rio'], true);
        this.adicionaAnimal('MACACO', 1, ['savana', 'floresta'], false);
        this.adicionaAnimal('GAZELA', 2, ['savana'], false);
        this.adicionaAnimal('HIPOPOTAMO', 4, ['savana', 'rio'], false);

        // Esse método deve ser utilizado caso seja criado ou excluido algum bioma, para garantir a ordem númerica
        this.bioma.sort((a,b) => a.numero - b.numero);
    }
    
    recintosViaveis(animalInfo, quantidade) {
        // Filtra os recintos que são aptos para ele viver
        let recintoApto = this.bioma.filter(recinto => animalInfo.bioma.some(bioma => recinto.bioma.includes(bioma)));
        let resultado = [];

        for (let i = 0; i < recintoApto.length; i++) {
            let recinto = recintoApto[i];
            let qntEspecies = recinto.animais.length;

            // 3) Animais já presentes no recinto devem continuar confortáveis com a inclusão do(s) novo(s)
            // Verificando se há mais de uma espécie no recinto
            let unico = false;
            if (qntEspecies == 0) {
                unico = true;
                // 5) Um macaco não se sente confortável sem outro animal no recinto, seja da mesma ou outra espécie
                if (quantidade === 1 && animalInfo.animal === 'MACACO') {
                    continue;
                }
            }
            else if (qntEspecies == 1) {
                unico = recinto.animais[0].animal === animalInfo.animal;;

                // 4) Hipopótamo(s) só tolera(m) outras espécies estando num recinto com savana e rio
                if (animalInfo.animal === 'HIPOPOTAMO' && !recinto.bioma.includes('savana') && !recinto.bioma.includes('rio')) {
                    continue;
                }
            }
            else if (qntEspecies > 1) {
                unico = false;

                // 4) Hipopótamo(s) só tolera(m) outras espécies estando num recinto com savana e rio
                if (animalInfo.animal === 'HIPOPOTAMO' && !recinto.bioma.includes('savana') && !recinto.bioma.includes('rio')) {
                    continue;
                }
            }

            // 2) Animais carnívoros devem habitar somente com a própria espécie
            // Retirando o recinto caso o animal seja carnivoro e não for a unica espécie
            if (animalInfo.carnivoro && !unico) {
                continue;
            }
            else if (!animalInfo.carnivoro && !unico) {
                // Se tiver algum carnivoro, passa para o proximo recinto
                let animalCarnivoro = recinto.animais.some(animal => {
                    let especieInfo = this.animaisValidos.find(especie => especie.animal === animal.animal);
                    if (especieInfo) {
                        if (especieInfo.carnivoro) {
                            return true; 
                        }
                    }
                    return false;
                });

                if (animalCarnivoro) {
                    continue;
                }
            }

            // 1) Um animal se sente confortável se está num bioma adequado e com espaço suficiente para cada indivíduo
            // Verificando se esse recinto possui espaço suficiente para receber os animais
            let espacoLivre = 0;
            let espacoOcupado = 0;
            
            let confortavel = true;
            for (let j = 0; j < recinto.animais.length; j++) {
                let animalRecinto = recinto.animais[j];
                let animalInfoRecinto = this.animaisValidos.find(especie => especie.animal === animalRecinto.animal);

                espacoOcupado += animalInfoRecinto.tamanho * animalRecinto.quantidade;

                // Verificar as condições para os animais já existentes no recinto
                // 4) Hipopótamo(s) só tolera(m) outras espécies estando num recinto com savana e rio
                if (animalInfoRecinto.animal === 'HIPOPOTAMO' && unico == false &&
                    ((recinto.bioma.includes('savana') && !recinto.bioma.includes('rio')) ||
                     (!recinto.bioma.includes('savana') && recinto.bioma.includes('rio')))) {
                        confortavel = false;
                        break;
                }
            }

            if (!confortavel) {
                continue;
            }

            if (!unico) {
                // 6) Quando há mais de uma espécie no mesmo recinto, é preciso considerar 1 espaço extra ocupado
                espacoLivre = recinto.tamanho - espacoOcupado - 1;
            }
            else {
                espacoLivre = recinto.tamanho - espacoOcupado;
            }

            let espacoNecessario = quantidade * animalInfo.tamanho;
            // Retirando o recinto caso não haja o espaço necessário
            if (espacoNecessario > espacoLivre) {
                continue;
            }
            
            resultado.push(`Recinto ${recinto.numero} (espaço livre: ${espacoLivre - espacoNecessario} total: ${recinto.tamanho})`);
        }

        return resultado;
    }

    analisaRecintos(animal, quantidade) {
        // Coleta as informações do animal
        let animalInfo = this.animaisValidos.find(especie => especie.animal === animal);

        // Checa se é um animal válido
        if (!animalInfo) {
            return {erro: "Animal inválido"};
        }

        // Checa se a quantidade é válida
        if (quantidade <= 0) {
            return {erro: "Quantidade inválida"};
        }

        const recintos = this.recintosViaveis(animalInfo, quantidade);

        if (recintos.length === 0) {
            return {erro: "Não há recinto viável"};
        }
    
        return {recintosViaveis: recintos};
    }

    /*
    // Função criada para verificar as condições de todos os recintos
    recintosDisponiveis() {
        let resultado = [];

        // Percorre os biomas
        for (let i = 0; i < this.bioma.length; i++) {
            let espacoOcupado = 0;
            let recinto = this.bioma[i];

            // Percorre os animais do bioma
            for (let j = 0; j < recinto.animais.length; j++) {
                let animal = recinto.animais[j];
                let animalInfo = this.animaisValidos.find(especie => especie.animal === animal);

                espacoOcupado += animalInfo.tamanho * animal.quantidade;
            }

            // Calcula o espaço livre do bioma
            let espacoLivre = recinto.tamanho - espacoOcupado;
            resultado.push(`Recinto ${recinto.numero} (espaço livre: ${espacoLivre} total: ${recinto.tamanho})`);
        }
        return resultado;
    }
        */
}

export { RecintosZoo as RecintosZoo };
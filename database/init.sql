-- Habilitar a extensão para gerar UUIDs automaticamente
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tabela de Materiais
CREATE TABLE materiais (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(100) NOT NULL,
    categoria VARCHAR(50) NOT NULL,
    unidade_medida VARCHAR(20) NOT NULL, -- Ex: Folha, Pacote, Caixa, Unidade
    quantidade_atual INTEGER NOT NULL DEFAULT 0 CHECK (quantidade_atual >= 0),
    estoque_minimo INTEGER NOT NULL DEFAULT 0,
    local_armazenamento VARCHAR(100),
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabela de Movimentações (Entradas e Saídas)
CREATE TABLE movimentacoes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    material_id UUID NOT NULL,
    tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('ENTRADA', 'SAIDA')),
    quantidade INTEGER NOT NULL CHECK (quantidade > 0),
    responsavel VARCHAR(100) NOT NULL,
    motivo_finalidade TEXT,
    data_movimentacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Chave Estrangeira garantindo o relacionamento com a tabela de materiais
    CONSTRAINT fk_material
        FOREIGN KEY(material_id) 
        REFERENCES materiais(id)
        ON DELETE RESTRICT
);
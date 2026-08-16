export const seoPages = [
  // Páginas Geo-Localizadas (Cidades)
  {
    slug: 'loja-de-perfumes-importados-bh',
    title: 'Loja de Perfumes Importados em BH | Miniaturas e Árabes',
    description: 'Compre perfumes importados e árabes em Belo Horizonte com entrega no mesmo dia. Especialistas em miniaturas de 25ml.',
    h1: 'Sua Loja de Perfumes Importados em Belo Horizonte',
    introText: 'Procurando por perfumes importados de alta qualidade em Belo Horizonte? Na Snack Store BH, oferecemos as melhores marcas mundiais e a famosa perfumaria árabe. Com nosso serviço de motoboy, você recebe suas fragrâncias no conforto de casa, no mesmo dia, na capital mineira.',
    filterRule: (perfumes) => perfumes, // Todos
    faqs: [
      { question: 'Vocês entregam perfumes em BH no mesmo dia?', answer: 'Sim! Para compras realizadas e aprovadas dentro do horário comercial, entregamos seu perfume importado no mesmo dia em Belo Horizonte via motoboy.' },
      { question: 'Os perfumes importados vendidos em BH são originais?', answer: 'Com certeza. Trabalhamos exclusivamente com perfumes 100% originais e selados, incluindo grandes marcas árabes como Lattafa e Armaf.' }
    ]
  },
  {
    slug: 'comprar-miniaturas-perfumes-sao-paulo',
    title: 'Comprar Miniaturas de Perfumes Importados em São Paulo (SP)',
    description: 'Enviamos miniaturas de perfumes importados originais para São Paulo (SP) via Sedex. Conheça nossa coleção de 25ml.',
    h1: 'Miniaturas de Perfumes Importados enviados para São Paulo',
    introText: 'Mora em São Paulo e quer colecionar grandes fragrâncias sem pagar fortunas? Nossa coleção de miniaturas de 25ml é a solução ideal. Enviamos todos os dias para a capital paulista e interior via transportadoras expressas com total segurança.',
    filterRule: (perfumes) => perfumes.slice(0, 12), // Amostra geral
    faqs: [
      { question: 'Qual o prazo de entrega de perfumes para São Paulo?', answer: 'O envio via Sedex/Transportadora para SP costuma levar de 1 a 3 dias úteis após a postagem. A embalagem é reforçada para garantir que seu perfume chegue intacto.' },
      { question: 'Quais miniaturas de 25ml fazem sucesso em São Paulo?', answer: 'Os queridinhos em SP são as linhas árabes Lattafa Asad e Lattafa Yara, conhecidos pela alta projeção.' }
    ]
  },

  // Páginas por Nicho (Tamanho/Volume)
  {
    slug: 'miniaturas-de-perfumes-25ml',
    title: 'Miniaturas de Perfumes 25ml Importados | As Melhores Marcas',
    description: 'O tamanho ideal para levar na bolsa ou colecionar. Compre miniaturas de perfumes importados de 25ml autênticos.',
    h1: 'As Melhores Miniaturas de Perfumes de 25ml',
    introText: 'Por que escolher um perfume de 25ml? Ele é o formato inteligente para quem gosta de variar aromas e levar sua assinatura olfativa no bolso ou na bolsa. Todos os nossos frascos de 25ml rendem dezenas de borrifadas e trazem as fragrâncias exatas de seus irmãos maiores.',
    filterRule: (perfumes) => perfumes.filter(p => p.volume === '25ml'),
    faqs: [
      { question: 'Quantas borrifadas rende um perfume de 25ml?', answer: 'Um perfume de 25ml rende aproximadamente de 250 a 300 borrifadas, sendo suficiente para meses de uso moderado.' },
      { question: 'É melhor comprar miniaturas ou frascos grandes?', answer: 'Miniaturas permitem que você conheça várias fragrâncias sem o investimento inicial alto de um frasco de 100ml. São excelentes para colecionadores.' }
    ]
  },

  // Páginas por Nicho Olfativo/Origem
  {
    slug: 'perfumes-arabes-importados',
    title: 'Perfumes Árabes Importados Originais | Lattafa, Armaf, Afnan',
    description: 'Descubra a opulência da perfumaria árabe. Alta fixação e aromas luxuosos que deixam rastro. Compre no Brasil.',
    h1: 'A Opulência dos Perfumes Árabes Importados',
    introText: 'A perfumaria oriental domina o mundo por seus ingredientes densos, madeiras preciosas (como o Oud) e performance nuclear que dura horas na pele. Descubra os campeões de elogios das grifes Lattafa, Armaf e Afnan.',
    filterRule: (perfumes) => perfumes.filter(p => ['Lattafa Perfumes', 'Armaf', 'Afnan'].includes(p.brand)),
    faqs: [
      { question: 'Por que os perfumes árabes têm tanta fixação?', answer: 'Eles utilizam concentrações elevadas de essência (muitas vezes Eau de Parfum ou Extrait de Parfum) e matérias-primas densas, como Oud, Âmbar e especiarias de alta qualidade.' },
      { question: 'Qual o perfume árabe mais vendido?', answer: 'Atualmente, o Armaf Club de Nuit Intense Man e os campeões da Lattafa (como Asad, Yara e Khamrah) são os mais cobiçados.' }
    ]
  },
  
  // Páginas por Gênero
  {
    slug: 'perfumes-masculinos-amadeirados-marcantes',
    title: 'Perfumes Masculinos Amadeirados Marcantes (Importados)',
    description: 'Fragrâncias de homem de presença. Perfumes masculinos importados com notas de madeira, couro e especiarias.',
    h1: 'Perfumes Masculinos Amadeirados e Marcantes',
    introText: 'Para o homem que quer deixar sua marca no ambiente. Selecionamos as fragrâncias masculinas com forte base amadeirada, perfeitas para reuniões de negócios, encontros ou eventos noturnos onde o poder deve ser sentido pelo olfato.',
    filterRule: (perfumes) => perfumes.filter(p => p.gender === 'Masculino' && p.description.toLowerCase().includes('amadeirad')),
    faqs: [
      { question: 'Onde usar um perfume masculino amadeirado?', answer: 'Perfumes amadeirados intensos são ideais para noites, clima ameno, festas e ambientes formais.' }
    ]
  },
  {
    slug: 'perfumes-femininos-doces-e-gourmands',
    title: 'Perfumes Femininos Doces e Gourmands | Fragrâncias Irresistíveis',
    description: 'As fragrâncias mais elogiadas com notas de baunilha, caramelo e frutas. Compre perfumes femininos doces de alta fixação.',
    h1: 'Perfumes Femininos Doces e Gourmands',
    introText: 'A família olfativa Gourmand é a favorita de quem ama arrancar elogios. Aqui agrupamos as opções femininas repletas de doçura, baunilha incensada, morango, caramelo e notas cremosas que são viciantes desde a primeira borrifada.',
    filterRule: (perfumes) => perfumes.filter(p => p.gender === 'Feminino' && (p.description.toLowerCase().includes('doce') || p.description.toLowerCase().includes('baunilha') || p.description.toLowerCase().includes('gourmand'))),
    faqs: [
      { question: 'O que é um perfume gourmand?', answer: 'Perfumes gourmands são aqueles compostos por notas olfativas sintéticas que lembram alimentos doces, como baunilha, chocolate, caramelo, mel e algodão doce.' },
      { question: 'Quais os melhores perfumes doces femininos?', answer: 'Os destaques árabes como Lattafa Yara, Yara Candy e Nebras são campeões de vendas nesse segmento.' }
    ]
  }
];

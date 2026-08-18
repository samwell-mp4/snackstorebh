import { cities } from './citiesData';

const manualSeoPages = [
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
  },
  {
    slug: 'onde-comprar-miniaturas-de-perfumes-importados-originais',
    title: 'Onde Comprar Miniaturas de Perfumes Importados Originais',
    description: 'Descubra onde comprar miniaturas de perfumes importados originais com segurança e entrega rápida em todo o Brasil. As melhores grifes em frascos de 25ml.',
    h1: 'Onde Comprar Miniaturas de Perfumes Importados Originais',
    introText: 'Encontrar miniaturas de perfumes importados 100% originais pode ser um desafio. Na Snack Store, garantimos a procedência de cada frasco de 25ml, oferecendo fragrâncias de luxo autênticas por um valor acessível. Somos a escolha confiável para quem busca qualidade sem surpresas.',
    filterRule: (perfumes) => perfumes,
    faqs: [
      { question: 'Como saber se a miniatura do perfume é original?', answer: 'Comprando em lojas de confiança como a Snack Store. Trabalhamos apenas com fornecedores oficiais e garantimos a autenticidade de todos os nossos produtos de 25ml.' }
    ]
  },
  {
    slug: 'onde-comprar-miniatura-de-perfume-importado-original',
    title: 'Onde Comprar Miniatura de Perfume Importado Original',
    description: 'A resposta definitiva para onde comprar miniatura de perfume importado original. Conheça nossa seleção de perfumes de 25ml de alta fixação.',
    h1: 'Onde Comprar Miniatura de Perfume Importado Original',
    introText: 'Se você se pergunta onde comprar miniatura de perfume importado original, está no lugar certo. Especializados no formato de 25ml, oferecemos as maiores marcas mundiais com garantia de originalidade, ideal para presentear ou para levar na bolsa.',
    filterRule: (perfumes) => perfumes,
    faqs: [
      { question: 'Vale a pena comprar miniatura de perfume importado original?', answer: 'Com certeza! É a melhor maneira de ter acesso a fragrâncias de grife investindo pouco, além de ser extremamente prático para o dia a dia.' }
    ]
  },
  {
    slug: 'onde-comprar-miniaturas-de-perfumes-importados-femininos',
    title: 'Onde Comprar Miniaturas de Perfumes Importados Femininos',
    description: 'Saiba onde comprar miniaturas de perfumes importados femininos. As fragrâncias mais elogiadas, de doces a florais, em práticos 25ml.',
    h1: 'Onde Comprar Miniaturas de Perfumes Importados Femininos',
    introText: 'As melhores coleções estão aqui. Onde comprar miniaturas de perfumes importados femininos não é mais segredo. De opções árabes envolventes como Lattafa Yara até clássicos modernos, temos a miniatura de 25ml perfeita para cada mulher.',
    filterRule: (perfumes) => perfumes.filter(p => p.gender === 'Feminino'),
    faqs: [
      { question: 'Quais miniaturas de perfumes femininos são mais vendidas?', answer: 'Os destaques árabes como Lattafa Yara, Yara Candy e Nebras são os preferidos pelas mulheres que buscam alta fixação.' }
    ]
  },
  {
    slug: 'onde-comprar-miniaturas-de-perfumes-importados',
    title: 'Onde Comprar Miniaturas de Perfumes Importados',
    description: 'Procurando onde comprar miniaturas de perfumes importados? Encontre fragrâncias árabes e globais autênticas de 25ml com o melhor custo-benefício.',
    h1: 'Onde Comprar Miniaturas de Perfumes Importados',
    introText: 'A Snack Store é a referência quando se trata de onde comprar miniaturas de perfumes importados. Selecionamos rigorosamente frascos de 25ml que entregam a mesma experiência luxuosa e projeção dos frascos regulares.',
    filterRule: (perfumes) => perfumes,
    faqs: [
      { question: 'Tem loja física para comprar as miniaturas?', answer: 'Somos um e-commerce com entrega super rápida. Em BH, oferecemos entrega no mesmo dia via motoboy.' }
    ]
  },
  {
    slug: 'como-comprar-miniaturas-de-perfumes-importados',
    title: 'Como Comprar Miniaturas de Perfumes Importados',
    description: 'Aprenda como comprar miniaturas de perfumes importados online com segurança. Dicas para escolher a sua fragrância de 25ml.',
    h1: 'Como Comprar Miniaturas de Perfumes Importados',
    introText: 'Saber como comprar miniaturas de perfumes importados é o primeiro passo para uma excelente coleção. Em nosso site, basta explorar o catálogo, adicionar as fragrâncias de 25ml desejadas na sacola e finalizar o pedido de forma rápida, tudo com a certeza de adquirir itens autênticos.',
    filterRule: (perfumes) => perfumes,
    faqs: [
      { question: 'Qual a forma de pagamento para comprar as miniaturas?', answer: 'Você finaliza seu pedido conosco através do WhatsApp, onde enviamos opções seguras de pagamento, como Pix.' }
    ]
  },
  {
    slug: 'onde-comprar-miniaturas-de-perfumes',
    title: 'Onde Comprar Miniaturas de Perfumes | 25ml',
    description: 'Descubra onde comprar miniaturas de perfumes. Ampla variedade de fragrâncias de 25ml para todos os gostos e ocasiões.',
    h1: 'Onde Comprar Miniaturas de Perfumes',
    introText: 'Seja para colecionar, presentear ou viajar, saber onde comprar miniaturas de perfumes de qualidade faz toda a diferença. Na Snack Store, dedicamo-nos a trazer os melhores aromas do mundo no prático tamanho de 25ml.',
    filterRule: (perfumes) => perfumes,
    faqs: [
      { question: 'Quantos dias demora para chegar a minha miniatura?', answer: 'Enviamos para todo o Brasil. O prazo depende do CEP e da modalidade (PAC ou Sedex) escolhida no momento da compra.' }
    ]
  },
  {
    slug: 'onde-comprar-miniatura-de-perfumes-importados',
    title: 'Onde Comprar Miniatura de Perfumes Importados',
    description: 'O melhor lugar onde comprar miniatura de perfumes importados. Garanta a sua fragrância favorita em 25ml com envio rápido.',
    h1: 'Onde Comprar Miniatura de Perfumes Importados',
    introText: 'Na busca de onde comprar miniatura de perfumes importados, qualidade e confiança vêm em primeiro lugar. Especialistas em frascos de 25ml, oferecemos as melhores essências árabes e grifes consagradas.',
    filterRule: (perfumes) => perfumes,
    faqs: [
      { question: 'A fixação de uma miniatura importada é boa?', answer: 'Sim, por serem 100% originais, a fixação é idêntica à do frasco em tamanho grande, muitas vezes durando mais de 10 horas.' }
    ]
  },
  {
    slug: 'onde-comprar-miniaturas-de-perfumes-em-paris',
    title: 'Onde Comprar Miniaturas de Perfumes em Paris x Comprar no Brasil',
    description: 'Buscando onde comprar miniaturas de perfumes em Paris? Veja por que comprar no Brasil na Snack Store é mais prático e acessível.',
    h1: 'Onde Comprar Miniaturas de Perfumes em Paris vs Brasil',
    introText: 'Muitos pesquisam onde comprar miniaturas de perfumes em Paris para trazer de viagem. No entanto, você não precisa cruzar o oceano! Na Snack Store, trazemos o luxo da perfumaria internacional até você, oferecendo miniaturas de 25ml prontas para envio no Brasil sem risco de taxação.',
    filterRule: (perfumes) => perfumes,
    faqs: [
      { question: 'Os perfumes são os mesmos vendidos na Europa?', answer: 'Sim, as fragrâncias originais que você encontraria em grandes lojas parisienses nós disponibilizamos aqui, em formato prático.' }
    ]
  },
  {
    slug: 'onde-comprar-miniaturas-de-perfumes-em-portugal',
    title: 'Onde Comprar Miniaturas de Perfumes em Portugal x Comprar no Brasil',
    description: 'Pesquisando onde comprar miniaturas de perfumes em Portugal? Compre no Brasil e evite taxas internacionais. Miniaturas originais de 25ml.',
    h1: 'Onde Comprar Miniaturas de Perfumes em Portugal vs Brasil',
    introText: 'Para quem tem dúvidas de onde comprar miniaturas de perfumes em Portugal, a solução mais vantajosa para quem está no Brasil é a nossa loja. Elimine as taxas alfandegárias e a longa espera adquirindo miniaturas originais de 25ml já disponíveis em território nacional.',
    filterRule: (perfumes) => perfumes,
    faqs: [
      { question: 'É seguro importar perfumes da Europa?', answer: 'Importar por conta própria pode gerar altas taxas. Por isso, oferecemos os produtos já nacionalizados para você comprar com segurança.' }
    ]
  },
  {
    slug: 'onde-comprar-miniaturas-de-perfume-importado-no-paraguai',
    title: 'Onde Comprar Miniaturas de Perfume Importado no Paraguai x Comprar no Brasil',
    description: 'Aonde comprar miniaturas de perfume importado no Paraguai? Evite viagens longas. Compre as melhores miniaturas de 25ml online no Brasil com segurança.',
    h1: 'Onde Comprar Miniaturas de Perfume Importado no Paraguai vs Brasil',
    introText: 'A busca por aonde comprar miniaturas de perfume importado no Paraguai é comum devido aos preços. Porém, viajar requer tempo e custos. Nós oferecemos a comodidade de comprar as melhores miniaturas originais de 25ml online, com ótimo custo-benefício e entrega segura na sua casa.',
    filterRule: (perfumes) => perfumes,
    faqs: [
      { question: 'O preço compensa se comparado ao Paraguai?', answer: 'Ao considerar gastos com viagem, hospedagem e tempo, comprar nossas miniaturas no Brasil oferece um excelente custo-benefício, com garantia de originalidade.' }
    ]
  }
];

const generatedSeoPages = [];

cities.forEach(city => {
  if (city.slug === 'belo-horizonte') return;

  // 1. Página de Miniaturas na Cidade
  generatedSeoPages.push({
    slug: `miniaturas-de-perfumes-importados-em-${city.slug}-${city.uf.toLowerCase()}`,
    title: `Miniaturas de Perfumes Importados em ${city.name} - ${city.uf} | Snack Store`,
    description: `Compre miniaturas de perfumes importados originais de 25ml em ${city.name} (${city.uf}). Receba em sua casa com frete seguro e envio rápido.`,
    h1: `Miniaturas de Perfumes Importados em ${city.name} - ${city.uf}`,
    introText: `Colecionar fragrâncias importadas originais em ${city.name} (${city.uf}) ficou muito mais fácil. Nossa curadoria de miniaturas de 25ml traz os perfumes árabes e importados mais desejados do mundo. Enviamos diariamente para toda a região de ${city.name} com embalagem ultra-protegida e postagem expressa.`,
    filterRule: (perfumes) => perfumes, // Exibe tudo
    faqs: [
      { question: `Como comprar miniaturas de perfumes em ${city.name} - ${city.uf}?`, answer: `Você pode comprar diretamente em nosso site e finalizar pelo WhatsApp. Enviamos para ${city.name} via Correios (Sedex ou PAC) com postagem rápida em até 24h.` },
      { question: `Quais as vantagens dos perfumes de 25ml em ${city.name}?`, answer: `As miniaturas de 25ml são práticas, perfeitas para levar na mala ou bolsa no dia a dia em ${city.name}, além de oferecerem o mesmo óleo essencial do frasco grande por uma fração do preço.` }
    ]
  });

  // 2. Página de Perfumes Árabes na Cidade
  generatedSeoPages.push({
    slug: `perfumes-arabes-importados-em-${city.slug}-${city.uf.toLowerCase()}`,
    title: `Perfumes Árabes Importados em ${city.name} - ${city.uf} | Lattafa e Armaf`,
    description: `Conheça a perfumaria árabe em ${city.name} (${city.uf}). Adquira fragrâncias de extrema projeção e fixação da Lattafa, Armaf e Afnan.`,
    h1: `Perfumes Árabes Importados em ${city.name} - ${city.uf}`,
    introText: `Os perfumes árabes são a maior tendência mundial de alta fixação e projeção. Agora, moradores de ${city.name} (${city.uf}) podem comprar originais árabes como Yara, Asad e Club de Nuit sem pagar taxas de importação ou esperar semanas. Enviamos de forma rápida e segura.`,
    filterRule: (perfumes) => perfumes.filter(p => ['Lattafa Perfumes', 'Armaf', 'Afnan'].includes(p.brand)),
    faqs: [
      { question: `Qual o prazo de entrega de perfumes árabes em ${city.name}?`, answer: `A entrega para ${city.name} - ${city.uf} depende da modalidade de frete selecionada, mas o envio é feito de forma expressa após a confirmação do pagamento.` },
      { question: `Os perfumes árabes realmente duram muito tempo na pele?`, answer: `Sim, marcas como Lattafa, Armaf e Afnan usam óleos essenciais de altíssima concentração, o que faz os perfumes projetarem e fixarem por até 12 horas ou mais.` }
    ]
  });
});

export const seoPages = [...manualSeoPages, ...generatedSeoPages];

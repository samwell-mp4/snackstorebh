import { cities } from './citiesData.js';
import { brandCollectionPages } from './brandCollectionSeoPages.js';

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
    slug: 'miniaturas-de-perfumes',
    title: 'Miniaturas de Perfumes Importados 25ml | As Melhores Marcas',
    description: 'Compre as melhores miniaturas de perfumes importados (25ml). Ideal para colecionar e levar na bolsa. Descubra fragrâncias masculinas e femininas.',
    h1: 'Descubra o Poder das Miniaturas de Perfumes Importados (25ml)',
    introText: 'Esqueça os frascos gigantes que você enjoa antes da metade. A revolução olfativa está nas miniaturas! Tenha a exata mesma fragrância de luxo, projeção absurda e qualidade impecável em um formato inteligente de 25ml. Monte uma verdadeira coleção de grife sem comprometer seu orçamento e leve seu aroma favorito sempre com você.',
    filterRule: (perfumes) => perfumes.filter(p => p.volume === '25ml'),
    videos: ['/assets/campaign/hero-video.mp4', '/assets/campaign/why-25ml-video.mp4'],
    videoFeatures: {
      eyebrow: "Design Inteligente",
      title: "PEQUENO NO TAMANHO.\nGIGANTE NA EXPERIÊNCIA.",
      subtitle: "As miniaturas trazem exatamente o mesmo óleo essencial e concentração dos frascos de luxo. Apenas no tamanho perfeito para o seu estilo de vida.",
      bullets: [
        "Cabe perfeitamente na bolsa ou necessaire",
        "Alta fixação (Mesma essência do frasco de 100ml)",
        "Preço acessível: permita-se ter uma verdadeira coleção",
        "Ideal para viagens: aceito em bagagens de mão"
      ]
    },
    faqs: [
      { question: 'Quantas borrifadas rende uma miniatura de perfume de 25ml?', answer: 'Uma miniatura de perfume de 25ml rende aproximadamente de 250 a 300 borrifadas. Usando diariamente com 4 a 5 borrifadas, o frasco pode durar cerca de dois meses.' },
      { question: 'A fixação de uma miniatura de perfume é a mesma do frasco grande?', answer: 'Sim! As nossas miniaturas contêm o mesmo líquido, concentração de essência e performance do frasco regular. A única diferença é o tamanho reduzido, ideal para transporte e experimentação.' },
      { question: 'É melhor comprar miniaturas ou frascos de 100ml?', answer: 'Depende do seu objetivo. As miniaturas de perfumes são excelentes para quem gosta de variar aromas ao longo da semana, permitindo que você tenha 4 perfumes diferentes pelo preço de um frasco grande. Além disso, cabem na bolsa ou no bolso para reaplicação.' }
    ]
  },
  {
    slug: 'comprar-mini-perfumes-importados',
    title: 'Mini Perfumes Importados | Qualidade Premium e Alta Fixação',
    description: 'Encontre os melhores mini perfumes importados. Fragrâncias árabes e de grife em tamanhos de 25ml. Explore nossa coleção premium.',
    h1: 'O Luxo da Alta Perfumaria em Mini Perfumes Importados',
    introText: 'Deseja fragrâncias que deixam um rastro poderoso e arrancam elogios? Nossa curadoria exclusiva de mini perfumes importados traz as joias da perfumaria árabe e de nicho para a palma da sua mão. Fixação nuclear, matérias-primas raras e uma presença inconfundível. Eleve seu nível de sofisticação hoje mesmo.',
    filterRule: (perfumes) => perfumes,
    videos: ['/assets/campaign/hero-video.mp4'],
    videoFeatures: {
      eyebrow: "Alta Perfumaria Árabe",
      title: "PROJEÇÃO INTENSA E FIXAÇÃO NUCLEAR.",
      subtitle: "Os perfumes árabes redefiniram o luxo. Extraits de Parfum que duram o dia todo na pele e deixam um rastro inesquecível.",
      bullets: [
        "Marcas renomadas: Lattafa, Armaf e Afnan",
        "Ingredientes nobres: Oud verdadeiro, âmbar e especiarias premium",
        "Performance extrema: projetam por horas e não saem da roupa",
        "Frascos miniatura de vidro de alta qualidade"
      ]
    },
    faqs: [
      { question: 'Quais as vantagens dos mini perfumes importados?', answer: 'Além do valor mais acessível, os mini perfumes importados são perfeitos para viagens (aceitos em bagagem de mão em voos), não pesam na bolsa e permitem que você crie um "guarda-roupa olfativo" com várias opções de aromas importados.' },
      { question: 'Os mini perfumes importados árabes têm boa projeção?', answer: 'Absolutamente. Os perfumes árabes em miniatura (como Lattafa e Armaf) são famosos por sua concentração intensa (geralmente Eau de Parfum ou Extrait). Eles deixam um rastro poderoso e duram muitas horas na pele.' }
    ]
  },
  {
    slug: 'kit-perfume-feminino',
    title: 'Kit Perfume Feminino em Miniaturas | Monte o Seu',
    description: 'Descubra as melhores opções para montar um kit de perfume feminino com miniaturas importadas. O presente perfeito.',
    h1: 'O Kit de Perfume Feminino Definitivo: Seja Inesquecível',
    introText: 'O segredo das mulheres marcantes? Ter uma fragrância perfeita para cada ocasião. Criar o seu kit de perfume feminino com nossas miniaturas de 25ml permite que você transite entre doces irresistíveis, florais luxuosos e gourmands viciantes. O presente ideal para si mesma ou para surpreender quem você ama.',
    filterRule: (perfumes) => perfumes.filter(p => p.gender === 'Feminino'),
    videos: ['/assets/campaign/why-25ml-video.mp4'],
    videoFeatures: {
      eyebrow: "Coleção Feminina",
      title: "CRIE A SUA PRÓPRIA ASSINATURA OLFATIVA.",
      subtitle: "Variedade é luxo. Monte o seu kit com fragrâncias doces para a noite, cítricas para o verão e florais para reuniões.",
      bullets: [
        "Fragrâncias gourmands super elogiadas (como Yara e Nebras)",
        "Combinações perfeitas para você criar camadas (layering)",
        "O presente perfeito que arranca suspiros",
        "Compre 2 ou mais e ganhe frete grátis (BH)"
      ]
    },
    faqs: [
      { question: 'Como montar um kit de perfumes importados em miniaturas?', answer: 'Você pode navegar por nossa seção feminina, adicionar 2 ou mais miniaturas diferentes à sua sacola e finalizar a compra. É uma excelente forma de montar um kit personalizado, variando entre perfumes pro dia e pra noite.' },
      { question: 'As miniaturas de perfume feminino servem para presente?', answer: 'São o presente perfeito! Um kit de perfumes importados em miniaturas demonstra cuidado, permite que a pessoa descubra novos aromas e vem em frascos elegantes que encantam à primeira vista.' }
    ]
  },
  {
    slug: 'perfume-miniatura-de-nicho-neeche-collection',
    title: 'Perfume Miniatura de Nicho e Alta Perfumaria',
    description: 'Conheça nossa seleção premium que compete com grandes nomes do nicho. Perfume miniatura de extrema qualidade e exclusividade.',
    h1: 'Perfumes Miniatura: A Exclusividade da Alta Perfumaria de Nicho',
    introText: 'Para os olfatos mais exigentes, que buscam sair do comum. Experimente a exclusividade das grandes casas de nicho através das nossas miniaturas árabes super premium. Descubra criações majestosas com Oud, especiarias exóticas e fixação que desafia o tempo, tudo no prático formato de 25ml.',
    filterRule: (perfumes) => perfumes.filter(p => p.categorySlugs?.includes('arabic-collection')),
    videos: ['/assets/campaign/hero-video.mp4'],
    videoFeatures: {
      eyebrow: "Edições Premium",
      title: "A EXPERIÊNCIA DO NICHO POR UM VALOR ACESSÍVEL.",
      subtitle: "Experimente as recriações mais luxuosas das casas Baccarat, Creed, Initio e Parfums de Marly em frascos de 25ml.",
      bullets: [
        "Perfumes complexos com evolução olfativa (Notas de saída, corpo e fundo)",
        "Embalagens que entregam uma experiência visual premium",
        "Perfumes marcantes e imponentes",
        "Ideal para colecionadores e aficionados por perfumes exclusivos"
      ]
    },
    faqs: [
      { question: 'O que define um perfume com qualidade de nicho?', answer: 'Perfumes de nicho são caracterizados pelo uso de matérias-primas raras, exclusivas e naturais, com foco na arte da perfumaria em vez de tendências de massa. Nossas miniaturas árabes entregam essa complexidade olfativa.' },
      { question: 'Onde encontrar perfume miniatura de luxo?', answer: 'Aqui na Snack Store, selecionamos rigorosamente as marcas árabes que entregam a mesma opulência das grifes de nicho mais caras do mundo, em práticos frascos de 25ml.' }
    ]
  },
  {
    slug: 'onde-comprar-miniaturas-de-perfumes-importados-originais',
    title: 'Onde Comprar Miniaturas de Perfumes Importados Originais',
    description: 'O guia definitivo de onde comprar miniaturas de perfumes importados originais com segurança, excelente preço e envio rápido para todo o Brasil.',
    h1: 'Onde Comprar Miniaturas de Perfumes Importados Originais',
    introText: 'Na hora de decidir onde comprar miniaturas de perfumes importados originais, a confiança e a procedência são fundamentais. A Snack Store se destaca por oferecer apenas produtos 100% autênticos, em tamanho de 25ml, que entregam a real experiência olfativa das grifes.',
    filterRule: (perfumes) => perfumes,
    videos: ['/assets/campaign/why-25ml-video.mp4'],
    videoFeatures: {
      eyebrow: "Confiança Total",
      title: "GARANTIA DE ORIGINALIDADE E COMPRA SEGURA.",
      subtitle: "A procedência de cada miniatura é nossa maior prioridade. Todos os frascos vêm de importadores oficiais para você.",
      bullets: [
        "100% de produtos originais selados de fábrica",
        "Estoque a pronta entrega, direto no Brasil sem taxas surpresas",
        "Envio ultrarrápido (Entregamos no mesmo dia em BH)",
        "Compra via plataforma blindada e parcelamento no cartão"
      ]
    },
    faqs: [
      { question: 'Como saber se a miniatura de perfume importado é original?', answer: 'Compre sempre em lojas especializadas e de confiança. Miniaturas originais possuem acabamento impecável no frasco, válvula spray de qualidade, código de lote (batch code) e o aroma evolui na pele de forma complexa, diferente de falsificações que têm cheiro puro de álcool no início e somem rapidamente.' },
      { question: 'Vale a pena comprar miniaturas de perfumes online?', answer: 'Sim, comprar online conosco garante que você receba o produto na sua casa com total segurança. Nossos estoques são climatizados para preservar as notas olfativas e enviamos tudo muito bem embalado.' }
    ]
  },
  {
    slug: 'onde-comprar-miniatura-de-perfume-importado-original',
    title: 'Onde Comprar Miniatura de Perfume Importado Original | 25ml',
    description: 'Procurando onde comprar miniatura de perfume importado original? Garanta a sua fragrância favorita em 25ml com envio rápido e compra segura.',
    h1: 'Onde Comprar Miniatura de Perfume Importado Original',
    introText: 'Especializados no formato de 25ml, oferecemos as maiores marcas mundiais com garantia de originalidade, ideal para presentear ou para levar na bolsa. Se você busca onde comprar miniatura de perfume importado original, sua busca termina aqui.',
    filterRule: (perfumes) => perfumes,
    faqs: [
      { question: 'Os frascos das miniaturas são de vidro?', answer: 'Sim, a grande maioria das nossas miniaturas originais vem em frascos de vidro grosso e de alta qualidade, preservando a essência e entregando um visual premium.' }
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
      { question: 'Tem loja física para comprar as miniaturas?', answer: 'Somos um e-commerce focado em entregar com rapidez e segurança em todo o Brasil. Em Belo Horizonte, oferecemos entrega no mesmo dia via motoboy.' }
    ]
  },
  {
    slug: 'como-comprar-miniaturas-de-perfumes-importados',
    title: 'Como Comprar Miniaturas de Perfumes Importados (Guia Prático)',
    description: 'Aprenda como comprar miniaturas de perfumes importados online com segurança. Dicas para escolher a sua fragrância de 25ml perfeita.',
    h1: 'Como Comprar Miniaturas de Perfumes Importados',
    introText: 'Saber como comprar miniaturas de perfumes importados é o primeiro passo para uma excelente coleção. Você pode basear sua escolha nas famílias olfativas (amadeirado, floral, cítrico) e buscar inspirações que combinem com sua personalidade.',
    filterRule: (perfumes) => perfumes,
    faqs: [
      { question: 'Como escolher minha primeira miniatura de perfume?', answer: 'Recomendamos começar com as fragrâncias mais vendidas (best-sellers) ou verificar a descrição das notas olfativas para ver se combinam com outros perfumes que você já gosta.' },
      { question: 'Qual a forma de pagamento para comprar as miniaturas no site?', answer: 'Você finaliza seu pedido conosco através do WhatsApp, onde enviamos as opções seguras de pagamento, como Pix, com atendimento humanizado para tirar qualquer dúvida.' }
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

export const seoPages = [...manualSeoPages, ...brandCollectionPages, ...generatedSeoPages];

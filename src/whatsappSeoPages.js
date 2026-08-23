const bcRule = (perfumes) => perfumes.filter(p => p.categorySlugs && p.categorySlugs.includes('brand-collection'));
const arabicRule = (perfumes) => perfumes.filter(p => p.categorySlugs && p.categorySlugs.includes('arabic-collection'));
const mascRule = (perfumes) => perfumes.filter(p => p.gender === 'Masculino');
const femRule = (perfumes) => perfumes.filter(p => p.gender === 'Feminino');
const lattafaRule = (perfumes) => perfumes.filter(p => p.brand === 'Lattafa Perfumes');
const allRule = (perfumes) => perfumes;

export const whatsappSeoPages = [
  // 1. HUB PAGE
  {
    slug: 'grupos-whatsapp',
    group: 'whatsapp-groups',
    title: 'Grupos de WhatsApp de Perfumes Importados e Ofertas | Snack Store',
    description: 'Encontre os canais oficiais e grupos de WhatsApp da Snack Store. Acompanhe novidades de perfumes importados, árabes, miniaturas de 25ml e ofertas em BH.',
    h1: 'Grupos de WhatsApp de Perfumes',
    introText: 'Seja bem-vindo ao hub de grupos da Snack Store. Aqui você encontra os links diretos para participar das nossas comunidades no WhatsApp. Selecione o grupo que melhor atende ao que você procura: novidades de perfumes importados, lançamentos de perfumes árabes, reposições de miniaturas de 25ml ou promoções exclusivas.',
    filterRule: allRule,
    faqs: [
      { question: 'Como entrar no grupo de perfumes da Snack Store?', answer: 'Você pode entrar clicando em qualquer um dos botões CTA desta página. Eles redirecionarão você diretamente para o grupo oficial da Snack Store no WhatsApp.' },
      { question: 'Os grupos de WhatsApp são gratuitos?', answer: 'Sim! A participação nos nossos grupos de ofertas, novidades e reposições é 100% gratuita. Você só paga pelos perfumes que escolher comprar.' },
      { question: 'Com que frequência as ofertas são enviadas?', answer: 'Enviamos atualizações diariamente com reposições de estoque e novidades de importados e árabes, garantindo que você seja notificado primeiro antes que os produtos esgotem.' }
    ]
  },
  // 2. PILAR PAGE
  {
    slug: 'grupos-whatsapp-perfumes',
    group: 'whatsapp-groups',
    title: 'Grupo de WhatsApp de Perfumes Importados e Árabes | Snack Store',
    description: 'Entre no grupo de WhatsApp da Snack Store e acompanhe perfumes importados, árabes, miniaturas 25ml, novidades, reposições e ofertas.',
    h1: 'Grupo de WhatsApp de Perfumes Importados',
    introText: 'Quer acompanhar novidades de perfumes importados, fragrâncias árabes de alta projeção, miniaturas de 25ml, reposições e ofertas selecionadas? Participe da nossa comunidade no WhatsApp e receba alertas diários diretamente no seu celular.',
    filterRule: allRule,
    faqs: [
      { question: 'Quais marcas de perfumes aparecem no grupo da Snack Store?', answer: 'Trabalhamos com marcas de luxo como Dior, Chanel, Paco Rabanne e Carolina Herrera, além de renomados fabricantes árabes como Lattafa, Armaf e Afnan, tanto em formato padrão quanto em miniaturas de 25ml.' },
      { question: 'Vocês realizam envio para todo o Brasil?', answer: 'Sim. Enviamos para todos os estados do Brasil através dos Correios (PAC ou Sedex) com frete seguro. Para Belo Horizonte e região metropolitana, oferecemos entrega expressa via motoboy no mesmo dia.' },
      { question: 'O que é enviado no grupo além de ofertas?', answer: 'Além de promoções exclusivas, informamos reposições de fragrâncias esgotadas, avaliações olfativas, dicas de fixação e lançamentos de novos perfumes importados.' }
    ]
  },
  // 3. SPECIFIC WHATSAPP LANDING PAGES
  {
    slug: 'grupo-whatsapp-perfumes-importados',
    group: 'whatsapp-groups',
    title: 'Grupo de WhatsApp de Perfumes Importados | Snack Store BH',
    description: 'Participe do nosso grupo de WhatsApp de perfumes importados. Lançamentos, novidades de grifes de luxo e reposições de miniaturas 25ml com preço acessível.',
    h1: 'Grupo de WhatsApp de Perfumes Importados',
    introText: 'Se você é fã de perfumes importados de grifes de luxo como Dior, Chanel, Paco Rabanne e Carolina Herrera, este é o seu lugar. No nosso grupo de WhatsApp, você acompanha a chegada de novos lotes de perfumes importados originais de 25ml, perfeitos para colecionar e usar em qualquer ocasião.',
    filterRule: bcRule,
    faqs: [
      { question: 'Os perfumes importados exibidos no grupo são originais?', answer: 'Sim, na Snack Store trabalhamos exclusivamente com perfumes 100% originais e selados, adquiridos diretamente de distribuidores oficiais.' },
      { question: 'Consigo encomendar um perfume importado específico pelo grupo?', answer: 'Sim! Caso a fragrância que você queira esteja esgotada, você pode falar diretamente com o nosso atendimento comercial e solicitar a reserva no próximo lote.' }
    ]
  },
  {
    slug: 'grupo-whatsapp-perfumes-arabes',
    group: 'whatsapp-groups',
    title: 'Grupo de WhatsApp de Perfumes Árabes | Lattafa, Armaf, Afnan',
    description: 'Entre no grupo de WhatsApp de perfumes árabes. Lançamentos exclusivos da Lattafa, Armaf, Afnan e novidades de alta fixação com entrega rápida em BH.',
    h1: 'Grupo de WhatsApp de Perfumes Árabes',
    introText: 'A perfumaria árabe conquistou o Brasil com sua fixação extrema e aromas luxuosos. No nosso grupo de WhatsApp de perfumes árabes, você acompanha em tempo real as novidades e reposições de marcas consagradas como Lattafa (Yara, Asad), Armaf (Club de Nuit) e Afnan (9PM).',
    filterRule: arabicRule,
    faqs: [
      { question: 'Quais marcas de perfumes árabes vocês vendem?', answer: 'Nossa coleção árabe conta com os principais perfumes da Lattafa Perfumes, Armaf, Afnan e outras marcas de nicho orientais conhecidas por sua performance extrema.' },
      { question: 'O que torna a perfumaria árabe diferente?', answer: 'Os perfumes árabes utilizam óleos essenciais de altíssima concentração e notas olfativas exóticas (como especiarias, Oud, baunilha e notas florais ricas), garantindo projeção absurda e fixação prolongada de mais de 12 horas.' }
    ]
  },
  {
    slug: 'grupo-whatsapp-ofertas-perfumes',
    group: 'whatsapp-groups',
    title: 'Grupo de Ofertas de Perfumes no WhatsApp | Snack Store BH',
    description: 'Acompanhe ofertas de perfumes importados, árabes e miniaturas 25ml no WhatsApp. Promoções exclusivas, descontos no Pix e frete grátis em BH.',
    h1: 'Grupo de Ofertas de Perfumes no WhatsApp',
    introText: 'Quer comprar perfumes importados e árabes com as melhores condições do mercado? No grupo de ofertas de perfumes da Snack Store, divulgamos promoções exclusivas, kits promocionais, condições de frete grátis e descontos para pagamento via Pix. Economize na sua próxima fragrância!',
    filterRule: allRule,
    faqs: [
      { question: 'As ofertas do grupo de WhatsApp duram por quanto tempo?', answer: 'Devido ao estoque limitado e alta procura de miniaturas e árabes, as ofertas costumam durar até o fim do estoque de cada lote, o que pode ocorrer em poucas horas.' },
      { question: 'Quais os métodos de pagamento aceitos nas ofertas?', answer: 'Aceitamos Pix (com descontos especiais), boleto bancário e parcelamento no cartão de crédito em até 12x.' }
    ]
  },
  {
    slug: 'grupo-whatsapp-miniaturas-perfumes',
    group: 'whatsapp-groups',
    title: 'Grupo de Miniaturas de Perfumes 25ml no WhatsApp | Snack Store',
    description: 'Acompanhe a reposição de miniaturas de perfumes importados de 25ml no WhatsApp. Brand Collection e árabes com o melhor preço e entrega expressa.',
    h1: 'Grupo de Miniaturas de Perfumes 25ml no WhatsApp',
    introText: 'As miniaturas de 25ml são fáceis de levar, colecionáveis e ideais para presentear. Como a demanda é muito alta, as reposições esgotam rápido. Participando do nosso grupo de WhatsApp de miniaturas, você recebe alertas imediatos assim que novas caixas de Brand Collection e mini árabes chegam ao estoque.',
    filterRule: bcRule,
    faqs: [
      { question: 'O que são as miniaturas Brand Collection?', answer: 'A Brand Collection é uma linha de perfumes em miniaturas de 25ml que reproduz fielmente as fragrâncias (essências originais de inspiração) e os frascos dos perfumes mais famosos do mundo.' },
      { question: 'Vale a pena comprar miniaturas de perfumes?', answer: 'Com certeza. Elas custam uma fração de um perfume de 100ml, o que permite que você compre e experimente 4 ou 5 fragrâncias de luxo diferentes pelo valor de um frasco grande, além de serem práticas para levar na bolsa.' }
    ]
  },
  {
    slug: 'grupo-whatsapp-perfumes-masculinos',
    group: 'whatsapp-groups',
    title: 'Grupo de WhatsApp de Perfumes Masculinos | Snack Store BH',
    description: 'Participe do nosso grupo de WhatsApp de perfumes masculinos. Receba novidades de amadeirados, aromáticos e perfumes masculinos árabes de alta projeção.',
    h1: 'Grupo de WhatsApp de Perfumes Masculinos',
    introText: 'Procura perfumes masculinos marcantes, amadeirados ou frescos de grifes importadas e marcas árabes? No grupo de WhatsApp de perfumes masculinos, divulgamos novidades de fragrâncias masculinas como Sauvage, Bleu de Chanel, Invictus, e os árabes Asad e Club de Nuit Intense.',
    filterRule: mascRule,
    faqs: [
      { question: 'Quais os perfumes masculinos mais procurados no grupo?', answer: 'Os campeões de vendas masculinos são Dior Sauvage, Bleu de Chanel, Paco Rabanne 1 Million, Invictus e o árabe Lattafa Asad.' },
      { question: 'Os perfumes masculinos são originais?', answer: 'Sim, todas as fragrâncias masculinas importadas e árabes disponíveis na Snack Store são 100% originais e seladas em suas respectivas embalagens.' }
    ]
  },
  {
    slug: 'grupo-whatsapp-perfumes-femininos',
    group: 'whatsapp-groups',
    title: 'Grupo de WhatsApp de Perfumes Femininos | Snack Store',
    description: 'Participe do grupo de WhatsApp de perfumes femininos. Novidades de fragrâncias gourmands, florais e perfumes femininos árabes como Yara e Nebras.',
    h1: 'Grupo de WhatsApp de Perfumes Femininos',
    introText: 'Para as amantes de fragrâncias florais, doces e gourmands, nosso grupo de WhatsApp de perfumes femininos traz reposições imediatas de clássicos como J\'adore, Good Girl, La Vie Est Belle, e os procurados perfumes árabes femininos Yara, Yara Tous e Yara Moi.',
    filterRule: femRule,
    faqs: [
      { question: 'Quais perfumes femininos fazem mais sucesso no WhatsApp?', answer: 'Fragrâncias gourmands e florais doces lideram a procura, destacando-se Carolina Herrera Good Girl, Lancôme La Vie Est Belle, Dior J\'adore e o árabe Lattafa Yara.' },
      { question: 'Consigo comprar miniaturas femininas de 25ml para presente?', answer: 'Sim! As miniaturas de 25ml vêm em frascos idênticos aos originais de luxo e caixas decoradas, sendo ótimas opções para presentes refinados e acessíveis.' }
    ]
  },
  {
    slug: 'grupo-whatsapp-perfumes-lattafa',
    group: 'whatsapp-groups',
    title: 'Grupo de WhatsApp de Perfumes Lattafa | Lançamentos e Reposições',
    description: 'Participe do grupo de WhatsApp de perfumes Lattafa. Acompanhe a reposição de Yara, Asad, Khamrah e novos lançamentos árabes originais em BH.',
    h1: 'Grupo de WhatsApp de Perfumes Lattafa',
    introText: 'A Lattafa Perfumes é a marca árabe mais desejada do momento. No nosso grupo de WhatsApp exclusivo para Lattafa, você recebe alertas de chegada dos best-sellers como Yara, Asad, Khamrah, Fakhar e Yara Candy. Garanta seu frasco original assim que chegar ao estoque.',
    filterRule: lattafaRule,
    faqs: [
      { question: 'Quais os principais perfumes Lattafa vendidos no grupo?', answer: 'Os destaques de importação da Lattafa são a linha feminina Yara (Yara Rosa, Tous Laranja, Moi Branco e Candy), o masculino Asad (líder de vendas), e a linha premium Khamrah.' },
      { question: 'Como saber se o perfume Lattafa é original?', answer: 'A Lattafa original possui selos holográficos tridimensionais da marca na caixa, relevos específicos no vidro e borrifadores de alta qualidade. Nós garantimos a procedência oficial de todos os nossos frascos.' }
    ]
  },
  
  // 4. B2B / RESELLER PAGES
  {
    slug: 'perfumes-para-revenda',
    group: 'reseller',
    title: 'Distribuidora de Perfumes Importados para Revenda | Snack Store',
    description: 'Revenda perfumes importados e árabes de 25ml. Compre direto da distribuidora com pedido mínimo baixo de 10 unidades e lucros de 80% a 120%.',
    h1: 'Perfumes Importados para Revenda',
    introText: 'Seja um parceiro de revenda da Snack Store. Trabalhamos com miniaturas de perfumes importados (25ml) e fragrâncias árabes de alta saída comercial. Oferecemos as melhores condições comerciais para você revender na sua região com excelente margem e suporte completo.',
    filterRule: allRule,
    faqs: [
      { question: 'Qual o pedido mínimo para compras no atacado/revenda?', answer: 'O pedido mínimo é de apenas 10 miniaturas (25ml), e você pode misturar fragrâncias masculinas, femininas, Brand Collection e árabes no mesmo pedido.' },
      { question: 'Qual a margem de lucro na revenda de mini perfumes?', answer: 'Nossos revendedores praticam margens de lucro de 80% a 120% sobre o preço de custo, obtendo um excelente retorno devido ao rápido giro dos produtos.' }
    ]
  },
  {
    slug: 'perfumes-para-lojistas',
    group: 'reseller',
    title: 'Fornecedor de Perfumes Importados para Lojistas | Snack Store',
    description: 'Abasteça sua loja com miniaturas Brand Collection e perfumes árabes originais no atacado. Pedido mínimo de 10 unidades e envio para todo o Brasil.',
    h1: 'Perfumes e Miniaturas para Lojistas',
    introText: 'Procura um fornecedor confiável de perfumes importados em formato miniatura (25ml) e perfumes árabes para a sua loja física ou virtual? A Snack Store atende lojistas em todo o Brasil com produtos 100% originais, embalados a pronta entrega e envio rápido.',
    filterRule: allRule,
    faqs: [
      { question: 'Como lojistas podem realizar pedidos no atacado?', answer: 'Basta entrar em contato com o nosso atendimento comercial via WhatsApp. Nós enviamos o catálogo com fotos prontas para divulgação e a tabela com preços diferenciados.' },
      { question: 'Os perfumes possuem garantia de originalidade para minha loja?', answer: 'Com certeza. Trabalhamos apenas com lotes originais e lacrados de fábrica. Seus clientes finais terão acesso à melhor qualidade olfativa do mercado.' }
    ]
  },
  {
    slug: 'perfumes-importados-atacado',
    group: 'reseller',
    title: 'Atacado de Perfumes Importados e Árabes | Snack Store BH',
    description: 'Compre perfumes árabes, Brand Collection e miniaturas importadas no atacado. Pedido mínimo de apenas 10 frascos mistos e entrega rápida via Sedex.',
    h1: 'Atacado de Perfumes Importados e Árabes',
    introText: 'Compre perfumes no atacado com condições facilitadas. Oferecemos preço diferenciado de atacado a partir de apenas 10 miniaturas (25ml) mistas de marcas de grife e perfumes árabes da Lattafa, Armaf e Afnan. Maximize seu lucro com produtos de altíssimo giro.',
    filterRule: allRule,
    faqs: [
      { question: 'Quais são as condições de frete para compras em atacado?', answer: 'Enviamos para todo o Brasil via Sedex ou PAC (Correios) com seguro integral. Para Belo Horizonte e municípios vizinhos, realizamos entrega expressa no mesmo dia via motoboy.' },
      { question: 'Posso pagar o pedido de atacado no cartão de crédito?', answer: 'Sim. Oferecemos desconto adicional para pagamentos à vista via Pix, mas você também pode parcelar seu pedido de atacado em até 12x no cartão de crédito.' }
    ]
  }
];

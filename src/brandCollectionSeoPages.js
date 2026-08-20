const bcRule = (perfumes) => perfumes.filter(p => p.categorySlugs && p.categorySlugs.includes('brand-collection'));

export const brandCollectionRawMappings = [
  { id: 1, name: "ATTRACTION MEN", inspiredBy: "Allure Homme Sport", brand: "Chanel", gender: "M" },
  { id: 3, name: "CH", inspiredBy: "CH Men/CH", brand: "Carolina Herrera", gender: "F" },
  { id: 5, name: "GOLD 999.9", inspiredBy: "1 Million", brand: "Paco Rabanne", gender: "M" },
  { id: 7, name: "I LOVE IT", inspiredBy: "J'adore", brand: "Dior", gender: "F" },
  { id: 8, name: "TOP MAN", inspiredBy: "212 VIP Men", brand: "Carolina Herrera", gender: "M" },
  { id: 9, name: "VIP LADY", inspiredBy: "212 VIP", brand: "Carolina Herrera", gender: "F" },
  { id: 12, name: "C'EST LA VIE", inspiredBy: "La Vie Est Belle", brand: "Lancôme", gender: "F" },
  { id: 14, name: "MISS FLORA", inspiredBy: "—", brand: "—", gender: "F" },
  { id: 15, name: "MISS YOU", inspiredBy: "Miss Dior Chérie", brand: "Dior", gender: "F" },
  { id: 16, name: "—", inspiredBy: "Lacoste White", brand: "Lacoste", gender: "M" },
  { id: 17, name: "—", inspiredBy: "Nina", brand: "Nina Ricci", gender: "F" },
  { id: 19, name: "—", inspiredBy: "Black XS for Her", brand: "Paco Rabanne", gender: "F" },
  { id: 20, name: "—", inspiredBy: "Dior Poison", brand: "Dior", gender: "F" },
  { id: 21, name: "DREAM BY COCONUT", inspiredBy: "Coco Mademoiselle", brand: "Chanel", gender: "F" },
  { id: 23, name: "—", inspiredBy: "Crystal Noir", brand: "Versace", gender: "F" },
  { id: 24, name: "—", inspiredBy: "Bright Crystal", brand: "Versace", gender: "F" },
  { id: 26, name: "—", inspiredBy: "Irresistible", brand: "Givenchy", gender: "F" },
  { id: 27, name: "—", inspiredBy: "Hypnotic Poison", brand: "Dior", gender: "F" },
  { id: 30, name: "—", inspiredBy: "Bright Crystal Absolu", brand: "Versace", gender: "F" },
  { id: 34, name: "ROSE LADY", inspiredBy: "212 VIP Rosé", brand: "Carolina Herrera", gender: "F" },
  { id: 37, name: "—", inspiredBy: "L'Extase", brand: "Nina Ricci", gender: "F" },
  { id: 43, name: "ALIEN", inspiredBy: "Alien", brand: "Mugler", gender: "F" },
  { id: 48, name: "—", inspiredBy: "Trésor Midnight Rose", brand: "Lancôme", gender: "F" },
  { id: 57, name: "—", inspiredBy: "Valentina", brand: "Valentino", gender: "F" },
  { id: 59, name: "—", inspiredBy: "Valentina Assoluto", brand: "Valentino", gender: "F" },
  { id: 69, name: "NIGHT", inspiredBy: "—", brand: "—", gender: "F" },
  { id: 70, name: "BLUE OCEAN", inspiredBy: "—", brand: "—", gender: "M" },
  { id: 73, name: "—", inspiredBy: "Poison Girl", brand: "Dior", gender: "F" },
  { id: 87, name: "ONLY LOVE", inspiredBy: "—", brand: "—", gender: "F" },
  { id: 97, name: "EUPHO", inspiredBy: "—", brand: "—", gender: "F" },
  { id: 100, name: "SAVAGE", inspiredBy: "Sauvage", brand: "Dior", gender: "M" },
  { id: 105, name: "GOLD DIAMOND", inspiredBy: "Lady Million", brand: "Paco Rabanne", gender: "F" },
  { id: 116, name: "WINNER", inspiredBy: "Invictus", brand: "Paco Rabanne", gender: "M" },
  { id: 126, name: "BEAUTY GIRL", inspiredBy: "Good Girl", brand: "Carolina Herrera", gender: "F" },
  { id: 132, name: "FANTASTIC", inspiredBy: "Fantasy", brand: "Britney Spears", gender: "F" },
  { id: 135, name: "—", inspiredBy: "L'Eau d'Issey Pour Homme", brand: "Issey Miyake", gender: "M" },
  { id: 136, name: "ESCANDAL", inspiredBy: "Scandal", brand: "Jean Paul Gaultier", gender: "F" },
  { id: 137, name: "—", inspiredBy: "Gucci Bloom", brand: "Gucci", gender: "F" },
  { id: 138, name: "—", inspiredBy: "Amor Amor", brand: "Cacharel", gender: "F" },
  { id: 143, name: "—", inspiredBy: "Neroli Portofino", brand: "Tom Ford", gender: "M" },
  { id: 151, name: "DIANA", inspiredBy: "—", brand: "—", gender: "F" },
  { id: 153, name: "—", inspiredBy: "Le Male", brand: "Jean Paul Gaultier", gender: "M" },
  { id: 154, name: "CLASSIC BLACK", inspiredBy: "Bleu de Chanel", brand: "Chanel", gender: "M" },
  { id: 155, name: "—", inspiredBy: "Aqua Go Eau de Parfum", brand: "—", gender: "M" },
  { id: 156, name: "—", inspiredBy: "212 Sexy Men", brand: "Carolina Herrera", gender: "M" },
  { id: 157, name: "—", inspiredBy: "Acqua di Gio", brand: "Giorgio Armani", gender: "F" },
  { id: 159, name: "—", inspiredBy: "Libre", brand: "Yves Saint Laurent", gender: "F" },
  { id: 162, name: "—", inspiredBy: "The One", brand: "Dolce & Gabbana", gender: "M" },
  { id: 163, name: "—", inspiredBy: "Hypnôse", brand: "Lancôme", gender: "F" },
  { id: 164, name: "—", inspiredBy: "Armani Code", brand: "Giorgio Armani", gender: "M" },
  { id: 165, name: "—", inspiredBy: "Armani Code Colonia", brand: "Giorgio Armani", gender: "M" },
  { id: 166, name: "—", inspiredBy: "Trésor", brand: "Lancôme", gender: "F" },
  { id: 167, name: "—", inspiredBy: "Aqva Pour Homme", brand: "Bvlgari", gender: "M" },
  { id: 168, name: "HEAVEN", inspiredBy: "Angel", brand: "Mugler", gender: "F" },
  { id: 169, name: "—", inspiredBy: "Pure Poison", brand: "Dior", gender: "F" },
  { id: 170, name: "—", inspiredBy: "Dylan Blue Pour Homme", brand: "Versace", gender: "M" },
  { id: 171, name: "—", inspiredBy: "Classique", brand: "Jean Paul Gaultier", gender: "F" },
  { id: 172, name: "—", inspiredBy: "BLV Pour Homme", brand: "Bvlgari", gender: "M" },
  { id: 177, name: "KHLOE", inspiredBy: "—", brand: "—", gender: "F" },
  { id: 188, name: "MY WAY", inspiredBy: "My Way", brand: "Giorgio Armani", gender: "F" },
  { id: 194, name: "SEXY LADY", inspiredBy: "212 Sexy", brand: "Carolina Herrera", gender: "F" },
  { id: 209, name: "—", inspiredBy: "New York Musk", brand: "Bond No. 9", gender: "M" },
  { id: 222, name: "—", inspiredBy: "Étoile Filante", brand: "Louis Vuitton", gender: "M" },
  { id: 238, name: "IDOL", inspiredBy: "Idôle", brand: "Lancôme", gender: "F" },
  { id: 258, name: "—", inspiredBy: "Gucci Guilty Absolute", brand: "Gucci", gender: "M" },
  { id: 259, name: "BLACK SCUDERIA", inspiredBy: "Ferrari Black", brand: "Ferrari", gender: "M" },
  { id: 263, name: "—", inspiredBy: "Gucci Guilty Absolute Pour Femme", brand: "Gucci", gender: "F" },
  { id: 272, name: "—", inspiredBy: "Miracle", brand: "Lancôme", gender: "F" },
  { id: 281, name: "—", inspiredBy: "Peony & Blush Suede", brand: "Jo Malone", gender: "F" },
  { id: 296, name: "ROBOT", inspiredBy: "Phantom", brand: "Paco Rabanne", gender: "M" },
  { id: 314, name: "—", inspiredBy: "California Dream", brand: "Louis Vuitton", gender: "F" },
  { id: 319, name: "—", inspiredBy: "Oud Palao", brand: "Diptyque", gender: "F" },
  { id: 328, name: "—", inspiredBy: "A Chant for the Nymph", brand: "Gucci", gender: "F" },
  { id: 340, name: "SKATE", inspiredBy: "212 Heroes", brand: "Carolina Herrera", gender: "M" },
  { id: 360, name: "—", inspiredBy: "Armani Code Parfum", brand: "Giorgio Armani", gender: "M" },
  { id: 365, name: "—", inspiredBy: "Fame", brand: "Paco Rabanne", gender: "F" },
  { id: 370, name: "—", inspiredBy: "Dylan Purple", brand: "Versace", gender: "F" },
  { id: 372, name: "—", inspiredBy: "Good Girl Gold Fantasy", brand: "Carolina Herrera", gender: "F" },
  { id: 378, name: "—", inspiredBy: "Fame Blooming Pink", brand: "Paco Rabanne", gender: "F" },
  { id: 382, name: "—", inspiredBy: "L'Interdit Eau de Parfum", brand: "Givenchy", gender: "F" },
  { id: 384, name: "—", inspiredBy: "Miss Dior Blooming Bouquet", brand: "Dior", gender: "F" },
  { id: 402, name: "—", inspiredBy: "Erba Pura", brand: "Xerjoff", gender: "F" },
  { id: 407, name: "—", inspiredBy: "Naxos", brand: "Xerjoff", gender: "F" },
  { id: 415, name: "—", inspiredBy: "Fame Parfum", brand: "Paco Rabanne", gender: "F" },
  { id: 433, name: "—", inspiredBy: "MYSLF", brand: "Yves Saint Laurent", gender: "M" },
  { id: 434, name: "—", inspiredBy: "Angels' Share", brand: "Kilian", gender: "F" },
  { id: 469, name: "—", inspiredBy: "Sauvage Elixir", brand: "Dior", gender: "M" }
];

const manualPages = [
  {
    slug: 'brand-collection-perfume',
    group: 'brand-collection',
    title: 'Brand Collection Perfume | Onde Comprar Perfumes Inspirados em Grifes',
    description: 'Conheça a Brand Collection: linha de perfumes inspirados em fragrâncias de grife. Veja onde comprar miniaturas originais de 25ml com ótimo preço.',
    h1: 'Brand Collection Perfume: Tudo Que Você Precisa Saber',
    introText: 'A Brand Collection é uma das marcas brasileiras mais pesquisadas no segmento de perfumaria, famosa por criar fragrâncias inspiradas em grandes grifes internacionais. No guia abaixo você entende o que é a marca, quais modelos fazem mais sucesso e por que muitas pessoas preferem comprar as versões originais em miniatura de 25ml. Se você quer a experiência de um perfume importado autêntico com preço acessível, conheça as melhores alternativas disponíveis na Snack Store BH.',
    filterRule: bcRule,
    faqs: [
      { question: 'O que é a Brand Collection?', answer: 'A Brand Collection é uma marca brasileira de perfumes conhecida por lançar fragrâncias inspiradas em perfumes famosos de grifes internacionais, com preço mais acessível.' },
      { question: 'Os perfumes Brand Collection são originais?', answer: 'Os perfumes Brand Collection são originais da própria marca, porém são inspirações (cópias olfativas) de fragrâncias de grifes. Se você busca a fragrância exatamente igual à original, prefira os importados autênticos, como os vendidos aqui em miniatura.' },
      { question: 'Onde comprar Brand Collection?', answer: 'Além de revendedores e e-commerces, você encontra alternativas de perfumes originais de grife em formato miniatura na Snack Store, com envio para todo o Brasil.' }
    ]
  },
  {
    slug: 'o-que-e-brand-collection',
    group: 'brand-collection',
    title: 'O Que É Brand Collection? Entenda a Marca de Perfumes Inspiração',
    description: 'Descubra o que é a Brand Collection, a marca de perfumes inspirados em grifes famosas. Vale a pena? Veja alternativas originais em miniatura 25ml.',
    h1: 'O Que É Brand Collection? Guia Completo Sobre a Marca',
    introText: 'Muita gente pesquisa o que é Brand Collection antes de comprar o primeiro frasco. A marca brasileira se consolidou como referência em perfumes inspiração, oferecendo aromas que lembram fragrâncias de luxo por uma fração do preço. Neste guia explicamos o posicionamento da marca, os modelos mais famosos e quando compensa investir na versão original do perfume em vez da inspiração. As miniaturas originais de 25ml são a opção perfeita para testar o perfume de grife verdadeiro antes de qualquer decisão.',
    filterRule: bcRule,
    faqs: [
      { question: 'Brand Collection é uma marca confiável?', answer: 'Sim, é uma marca estabelecida no mercado brasileiro. Porém, é importante saber que seus perfumes são inspirações de grifes, não os originais.' },
      { question: 'Qual a diferença entre Brand Collection e perfume original?', answer: 'A diferença está na composição e na performance. Os originais usam essências e concentrações exatas da marca de luxo; as inspirações tentam imitar o aroma com um custo menor.' }
    ]
  },
  {
    slug: 'brand-collection-site-oficial',
    group: 'brand-collection',
    title: 'Brand Collection Site Oficial | Como Comprar com Segurança',
    description: 'Quer comprar Brand Collection no site oficial? Veja como fazer uma compra segura e conheça alternativas de perfumes originais em miniatura 25ml.',
    h1: 'Brand Collection Site Oficial: Como Comprar com Segurança',
    introText: 'A busca por brand collection site oficial cresce todos os meses, mas encontrar o canal de venda correto nem sempre é simples. Antes de comprar, verifique se o site é mesmo da marca ou de um revendedor autorizado, confira a política de troca e a procedência do produto. Se a sua intenção é ter a fragrância original de uma grife, a alternativa mais segura é adquirir miniaturas autênticas de 25ml, garantidas pela Snack Store, com entrega para todo o Brasil e pagamento facilitado.',
    filterRule: bcRule,
    faqs: [
      { question: 'Qual é o site oficial da Brand Collection?', answer: 'Sempre desconfie de sites duplicados. Prefira comprar por canais oficiais da marca ou de lojas com reputação comprovada, como a nossa.' },
      { question: 'Comprar perfume importado em miniatura é seguro?', answer: 'Sim. Na Snack Store trabalhamos apenas com frascos 100% originais e lacrados, oferecendo nota fiscal e suporte via WhatsApp.' }
    ]
  },
  {
    slug: 'brand-collection-direto-da-fabrica',
    group: 'brand-collection',
    title: 'Brand Collection Direto da Fábrica | Vale a Pena Comprar?',
    description: 'Comprar Brand Collection direto da fábrica é confiável? Veja os cuidados e descubra alternativas de perfumes importados originais em miniatura 25ml.',
    h1: 'Brand Collection Direto da Fábrica: Compensa?',
    introText: 'Muitos buscam brand collection direto da fábrica atrás de preços menores. O problema é que essa rota costuma exigir volume mínimo de revenda e não oferece garantia de procedência para quem quer apenas um frasco. Para quem deseja a fragrância original de uma grife, o caminho mais inteligente é comprar uma miniatura autêntica de 25ml: custo baixo, garantia de originalidade e a mesma essência do frasco grande. Compare e veja o que faz mais sentido para o seu bolso.',
    filterRule: bcRule,
    faqs: [
      { question: 'Existe venda direto da fábrica da Brand Collection?', answer: 'Geralmente a venda direta é feita para revendedores com pedido mínimo. Para compras avulsas, lojas e representantes são o caminho comum.' },
      { question: 'Vale mais a pena comprar inspiração ou miniatura original?', answer: 'Depende do objetivo: a inspiração imita o cheiro; a miniatura original entrega exatamente a fragrância da grife, ideal para quem preza pela autenticidade.' }
    ]
  },
  {
    slug: 'brand-collection-inspiracao',
    group: 'brand-collection',
    title: 'Perfumes Inspiração | Brand Collection e Alternativas Originais',
    description: 'Perfumes inspiração são clones de grifes famosas. Veja os modelos Brand Collection inspiração mais vendidos e alternativas originais em 25ml.',
    h1: 'Perfumes Inspiração: Brand Collection e as Alternativas Originais',
    introText: 'O termo inspiração virou sinônimo de perfume semelhante a um de grife, e a Brand Collection é mestre nesse jogo. Modelos como o 005, 100, 156 e 188 imitam fragrâncias que custam centenas de reais. Porém, uma inspiração nunca reproduz 100% a composição original. Se você quer o aroma fiel e a performance da marca de luxo, as miniaturas importadas originais de 25ml da Snack Store são a escolha certa para testar e colecionar.',
    filterRule: bcRule,
    faqs: [
      { question: 'O que significa perfume inspiração?', answer: 'É um perfume criado para se parecer com uma fragrância famosa de grife, mas feito com sua própria formulação e sem usar as essências originais da marca.' },
      { question: 'Perfume inspiração fixa igual ao original?', answer: 'Na maioria dos casos não. As versões originais costumam ter concentração e matérias-primas superiores, resultando em melhor fixação e projeção.' }
    ]
  },
  {
    slug: 'brand-collection-masculino',
    group: 'brand-collection',
    title: 'Brand Collection Masculino | Perfumes para Homem',
    description: 'Os melhores perfumes masculinos inspirados em grifes. Veja o que procurar na linha Brand Collection masculino e alternativas originais em 25ml.',
    h1: 'Brand Collection Masculino: Guia de Compra Completo',
    introText: 'A linha Brand Collection masculino reúne algumas das inspirações mais procuradas do país, com fragrâncias que imitam grandes clássicos da perfumaria internacional. Neste guia, listamos o que considerar antes de comprar: fixação, ocasião de uso e a diferença entre a inspiração e o perfume original. Se você quer a fragrância autêntica da grife com preço acessível, confira as miniaturas masculinas originais de 25ml da Snack Store.',
    filterRule: bcRule,
    faqs: [
      { question: 'Quais os perfumes masculinos Brand Collection mais vendidos?', answer: 'Os modelos inspirados em clássicos adocicados e amadeirados estão entre os mais vendidos, como o 005, 100 e o 116.' },
      { question: 'Vale comprar miniatura masculina original de 25ml?', answer: 'Sim. Você testa a fragrância original da grife por um valor baixo e pode até colecionar várias opções.' }
    ]
  },
  {
    slug: 'brand-collection-e-bom',
    group: 'brand-collection',
    title: 'O Perfume Brand Collection É Bom? Opinião Sincera',
    description: 'Vale a pena comprar perfumes Brand Collection? Respondemos se é bom, falamos sobre fixação e projeção e mostramos alternativas originais em 25ml.',
    h1: 'Brand Collection É Bom? Nossa Avaliação',
    introText: 'A dúvida sobre se o perfume Brand Collection é bom é uma das mais comuns entre os compradores. No geral, a marca entrega bom custo-benefício: aromas agradáveis, que lembram grifes famosas, por preço acessível. A principal ressalva é a fixação e a fidelidade ao aroma original. Quem valoriza a experiência completa do perfume de luxo tende a preferir a versão original. As miniaturas autênticas de 25ml da Snack Store permitem essa experiência por um custo baixíssimo.',
    filterRule: bcRule,
    faqs: [
      { question: 'O perfume Brand Collection fixa bem?', answer: 'A fixação varia de modelo para modelo e geralmente é menor que a do original de grife, dependendo da composição de cada inspiração.' },
      { question: 'O perfume Brand Collection vale a pena?', answer: 'Vale se você busca um aroma inspirado por um preço baixo. Para quem quer a fragrância fiel à grife, a miniatura original de 25ml é a melhor escolha.' }
    ]
  },
  {
    slug: 'como-revender-brand-collection',
    group: 'brand-collection',
    title: 'Como Revender Brand Collection | Dicas para Revendedores',
    description: 'Quer revender perfumes Brand Collection? Veja dicas de como começar e como aumentar seu lucro com perfumes de alta saída.',
    h1: 'Como Revender Brand Collection e Lucrar Mais',
    introText: 'Revender perfumes é um negócio lucrativo, e a Brand Collection é uma das marcas com maior giro no Brasil por causa da demanda de suas inspirações. Para começar, pesquise fornecedores confiáveis, invista em embalagem e aposte no atendimento pelo WhatsApp e redes sociais. Outra estratégia é oferecer também miniaturas originais de grife, que aumentam o ticket médio e a confiança dos clientes. A Snack Store pode ser sua parceira nessa segunda linha de produtos.',
    filterRule: bcRule,
    faqs: [
      { question: 'Preciso de CNPJ para revender perfumes?', answer: 'Não obrigatoriamente, mas formalizar com MEI facilita a compra com fornecedores e dá mais credibilidade aos clientes.' },
      { question: 'Qual a margem de lucro na revenda de perfumes?', answer: 'A margem varia muito, mas a combinação de inspirações (giro rápido) com miniaturas originais de grife costuma ser a mais lucrativa.' }
    ]
  },
  {
    slug: 'brand-collection-feminino',
    group: 'brand-collection',
    title: 'Brand Collection Feminino | Perfumes para Mulher',
    description: 'Perfumes Brand Collection femininos mais desejados. Veja os modelos que fazem sucesso e alternativas originais de 25ml de alta fixação.',
    h1: 'Brand Collection Feminino: Os Modelos Mais Procurados',
    introText: 'A linha Brand Collection feminino é um verdadeiro fenômeno entre quem ama perfumes inspirados em grifes. Do adocicado ao floral, os modelos femininos imitam fragrâncias que fazem sucesso no mundo inteiro. Para quem prefere a fragrância original, com a fixação e a evolução olfativa da marca de luxo, a Snack Store oferece miniaturas autênticas femininas de 25ml das mais famosas grifes do mundo.',
    filterRule: bcRule,
    faqs: [
      { question: 'Qual o perfume feminino Brand Collection mais vendido?', answer: 'Os modelos inspirados em fragrâncias adocicadas e gourmands famosas estão entre os preferidos das consumidoras, como o 012 e o 136.' },
      { question: 'Onde comprar miniatura feminina original de perfume?', answer: 'Na Snack Store você encontra miniaturas femininas originais de 25ml, com envio para todo o Brasil e pagamento via Pix.' }
    ]
  },
  {
    slug: 'onde-comprar-brand-collection',
    group: 'brand-collection',
    title: 'Onde Comprar Brand Collection | Guia Seguro de Compra',
    description: 'Onde comprar Brand Collection com segurança? Veja o que considerar e conheça alternativas de perfumes originais em miniatura de 25ml.',
    h1: 'Onde Comprar Brand Collection: Guia Completo',
    introText: 'Se você procura onde comprar Brand Collection, o mais importante é garantir a procedência e evitar sites falsos. Prefira lojas com reputação, que ofereçam nota fiscal e suporte ao cliente. Uma alternativa inteligente é investir em miniaturas originais de grife: além de serem autênticas, custam pouco e entregam a fragrância fiel. Na Snack Store, você compra com segurança, recebe em todo o Brasil e ainda tem atendimento humano via WhatsApp.',
    filterRule: bcRule,
    faqs: [
      { question: 'Como saber se o vendedor de Brand Collection é confiável?', answer: 'Verifique avaliações, peça nota fiscal e confira se a loja tem canais oficiais de contato e política de troca.' },
      { question: 'Comprar miniatura original de perfume é mais seguro?', answer: 'Sim, especialmente quando você compra de uma loja especializada que trabalha apenas com produtos 100% originais.' }
    ]
  },
  {
    slug: 'dream-brand-collection',
    group: 'brand-collection',
    title: 'Dream Brand Collection | Perfumes e Site Oficial da Marca',
    description: 'Conheça a linha Dream Brand Collection, perfumes inspirados em frascos temáticos de grifes. Veja alternativas originais de 25ml.',
    h1: 'Dream Brand Collection: Charme e Perfumaria Inspiração',
    introText: 'A Dream Brand Collection é uma extensão famosa de perfumes inspirados, conhecida por trazer frascos temáticos que imitam os designs mais criativos da perfumaria internacional. Embora charmosa, quem preza por fixação duradoura e fidelidade ao aroma de luxo costuma preferir os perfumes importados de grife autênticos. Descubra as miniaturas originais de 25ml na Snack Store BH e tenha o verdadeiro luxo em mãos.',
    filterRule: bcRule,
    faqs: [
      { question: 'Qual a diferença entre Brand Collection e Dream Brand Collection?', answer: 'Ambas pertencem ao mesmo fabricante, mas a linha Dream foca em frascos temáticos lúdicos (como sapatos, bolsas e estrelas) enquanto a linha tradicional imita o formato padrão dos frascos originais.' },
      { question: 'Onde comprar alternativas originais e autênticas no Brasil?', answer: 'A Snack Store é referência em miniaturas 100% originais de grife, entregando em todo o país.' }
    ]
  },
  {
    slug: 'onde-fica-a-fabrica-da-brand-collection',
    group: 'brand-collection',
    title: 'Onde Fica a Fábrica da Brand Collection? Descubra a Origem',
    description: 'Curioso para saber onde fica a fábrica da Brand Collection? Entenda a origem dos perfumes inspiração e veja alternativas originais.',
    h1: 'Onde Fica a Fábrica da Brand Collection? Descubra a Origem',
    introText: 'A pergunta "onde fica a fábrica da Brand Collection" intriga muitos consumidores que buscam comprar no atacado ou entender de onde vêm essas famosas inspirações de 25ml. Embora seja uma marca amplamente distribuída no Brasil, sua fabricação de fragrâncias inspiradas ocorre no exterior e é importada por grandes distribuidores. Se você preza por grifes oficiais e quer fragrâncias autênticas produzidas na França, Itália ou Oriente Médio, conheça as miniaturas de 25ml originais na Snack Store BH.',
    filterRule: bcRule,
    faqs: [
      { question: 'A Brand Collection é fabricada no Brasil?', answer: 'Não. A fabricação ocorre principalmente no exterior, sendo importada por revendedores brasileiros para distribuição nacional.' },
      { question: 'Quais são as alternativas originais com fabricação oficial de grife?', answer: 'Trabalhamos com marcas originais francesas, italianas e árabes autênticas (como Lattafa e Armaf) importadas legalmente.' }
    ]
  },
  {
    slug: 'brand-collection-25ml-miniaturas',
    group: 'brand-collection',
    title: 'Brand Collection 25ml Miniaturas | O Formato Prático de Perfumes',
    description: 'Por que as miniaturas Brand Collection 25ml fazem tanto sucesso? Entenda a febre das miniaturas e compre opções originais no Brasil.',
    h1: 'Brand Collection 25ml Miniaturas: O Sucesso das Fragrâncias de Bolso',
    introText: 'As miniaturas de 25ml da Brand Collection revolucionaram o mercado de perfumes no Brasil, permitindo colecionar e levar fragrâncias inspiradas para qualquer lugar. Mas você sabia que também pode comprar as miniaturas originais de grife em frascos de 25ml com a mesma praticidade? Na Snack Store BH, somos especialistas em miniaturas legítimas de 25ml de grandes marcas mundiais e perfumaria árabe de alta performance. Tenha a essência real com frete facilitado.',
    filterRule: bcRule,
    faqs: [
      { question: 'Quantas borrifadas rende uma miniatura de 25ml?', answer: 'Uma miniatura de 25ml rende entre 250 a 300 borrifadas, durando meses mesmo com uso frequente.' },
      { question: 'As miniaturas originais vendidas na Snack Store são confiáveis?', answer: 'Sim! Garantimos 100% de originalidade em todas as nossas miniaturas árabes e importadas, com lacre e suporte especializado.' }
    ]
  },
  {
    slug: 'tabela-brand-collection',
    group: 'brand-collection',
    title: 'Tabela Brand Collection | Lista Completa de Inspirações Olfativas',
    description: 'Acesse a tabela Brand Collection completa e atualizada. Veja a equivalência de cada número com o perfume importado original correspondente.',
    h1: 'Tabela Brand Collection: Guia Completo de Inspirações',
    introText: 'Procurando por um número específico da Brand Collection? Preparamos o maior índice de referências olfativas da internet. Abaixo, você encontra a tabela interativa completa mapeando cada número da marca ao perfume importado de grife correspondente. Encontre o seu favorito e compre a miniatura original com o melhor preço e suporte na Snack Store.',
    filterRule: bcRule,
    faqs: [
      { question: 'Como funciona a numeração da Brand Collection?', answer: 'Cada número no frasco representa uma referência olfativa (uma inspiração) de um perfume importado consagrado. As embalagens são réplicas em miniatura dos frascos de grife.' },
      { question: 'Se a miniatura que quero não tiver em estoque?', answer: 'Você pode entrar em contato conosco pelo WhatsApp. Oferecemos as melhores miniaturas originais de importados e marcas árabes como alternativa perfeita.' }
    ]
  },
  {
    slug: 'brand-collection-atacado',
    group: 'brand-collection',
    title: 'Brand Collection Atacado | Revenda Perfumes em Miniatura',
    description: 'Quer revender Brand Collection no atacado? Conheça os passos para começar sua distribuidora de miniaturas e lucrar muito.',
    h1: 'Brand Collection Atacado: Como Revender Miniaturas',
    introText: 'O mercado de miniaturas de perfumes é um dos que mais cresce no Brasil, movido pelo baixo investimento e alto apelo de venda dos frascos de 25ml. Descubra as dicas essenciais para comprar no atacado, definir sua margem de lucro e atrair revendedoras. Aumente seu ticket médio oferecendo também as miniaturas 100% originais de grife e árabes disponíveis na Snack Store.',
    filterRule: bcRule,
    faqs: [
      { question: 'Qual a margem de lucro na revenda de miniaturas?', answer: 'Geralmente as revendedoras conseguem margens de 40% a 100% dependendo do volume de compra e da região de atuação.' },
      { question: 'Vocês vendem atacado de importados originais?', answer: 'Sim! Fale com nosso atendimento no WhatsApp para condições especiais de compras em maior quantidade.' }
    ]
  },
  {
    slug: 'como-saber-se-o-perfume-brand-collection-e-original',
    group: 'brand-collection',
    title: 'Como Saber se o Perfume Brand Collection é Original | Guia',
    description: 'Aprenda a identificar réplicas e saiba como saber se o perfume Brand Collection é original. Guia de autenticidade para compradores.',
    h1: 'Como Saber se o Perfume Brand Collection é Original',
    introText: 'Com o sucesso estrondoso das miniaturas de 25ml, surgiram falsificações de baixa qualidade no mercado. Neste guia prático, ensinamos os principais sinais de autenticidade da embalagem, frasco e fixação para você não ser enganado. Compre com a segurança de quem trabalha apenas com produtos autênticos: conheça as miniaturas de grife e árabes na Snack Store.',
    filterRule: bcRule,
    faqs: [
      { question: 'Como identificar um Brand Collection falso?', answer: 'Frascos com rebarbas no vidro, logotipos borrados, válvulas que vazam e cheiro excessivamente alcoólico sem fixação são sinais claros de falsificação.' },
      { question: 'Onde comprar miniaturas originais com garantia?', answer: 'Compre em lojas com reputação estabelecida como a Snack Store, que oferece suporte humanizado e garantia de procedência em cada frasco.' }
    ]
  }
];

const generatedNumberedPages = brandCollectionRawMappings.map(item => {
  const numStr = String(item.id).padStart(3, '0');
  const hasInspiration = item.inspiredBy && item.inspiredBy !== '—';
  
  const inspiredStr = hasInspiration ? ` (Inspiração ${item.inspiredBy})` : '';
  const inspiredInfo = hasInspiration ? `inspirado no clássico ${item.inspiredBy} da grife ${item.brand}` : 'da linha de miniaturas premium';
  const titleGender = item.gender === 'M' ? 'Masculino' : item.gender === 'F' ? 'Feminino' : 'Compartilhável';
  
  const title = `Brand Collection ${numStr}${inspiredStr} | Perfume Miniatura 25ml`;
  const description = `Saiba tudo sobre o Brand Collection ${numStr}, perfume travel size de 25ml ${inspiredInfo}. Compre online com envio rápido no Brasil na Snack Store.`;
  const h1 = `Brand Collection ${numStr}${hasInspiration ? `: ${item.inspiredBy}` : ''}`;
  
  const introText = `O Brand Collection ${numStr} é o perfume em miniatura de 25ml ${inspiredInfo}, ideal para o público ${titleGender.toLowerCase()}. Famoso por sua similaridade olfativa e pelo frasco detalhado que remete à fragrância de grife, ele é o modelo inteligente para colecionar e levar para qualquer lugar. Encontre alternativas originais e miniaturas de grife autênticas com fixação premium na Snack Store BH, prontas para envio imediato.`;

  const faqs = [
    {
      question: `Qual perfume original inspirou o Brand Collection ${numStr}?`,
      answer: hasInspiration 
        ? `O Brand Collection ${numStr} é inspirado na consagrada fragrância ${item.inspiredBy} da grife ${item.brand}.`
        : `O Brand Collection ${numStr} faz parte da nossa coleção de miniaturas de 25ml. Entre em contato via WhatsApp para confirmar a referência exata da fragrância.`
    },
    {
      question: `Qual a fixação do Brand Collection ${numStr}?`,
      answer: `Por se tratar de uma inspiração de alta qualidade, a fixação costuma variar de 4h a 8h na pele, dependendo do tipo de pele e da família olfativa. Para fixações superiores de até 12h, recomendamos conhecer nossas miniaturas árabes originais.`
    }
  ];

  return {
    slug: `brand-collection-${numStr}`,
    group: 'brand-collection',
    title: title,
    description: description,
    h1: h1,
    introText: introText,
    filterRule: bcRule,
    faqs: faqs
  };
});

export const brandCollectionPages = [...manualPages, ...generatedNumberedPages];

export const idToEnTasks = {
  'Menentukan tanggal lamaran dan pernikahan': 'Determine engagement and wedding dates',
  'Budgeting': 'Budgeting',
  'Membuat wedding moodboard': 'Create wedding moodboard',
  'Menentukan tema acara': 'Determine event theme',
  'First family meeting': 'First family meeting',
  'Membuat list vendor': 'Create vendor list',
  'Datang ke wedding exhibition': 'Attend wedding exhibition',
  'Mengikuti kelas pra-nikah': 'Attend pre-marital class',
  'Pre-marital check-up': 'Pre-marital check-up',
  
  'Booking venue lamaran': 'Book engagement venue',
  'Booking dekorasi lamaran': 'Book engagement decoration',
  'Booking MC lamaran': 'Book engagement MC',
  'Beli / sewa attire lamaran': 'Buy/rent engagement attire',
  'Membeli bunga': 'Buy flowers',
  'Membeli cincin lamaran': 'Buy engagement ring',
  'Fiksasi vendor lamaran': 'Finalize engagement vendors',
  'Lamaran': 'Engagement Day',
  
  'Menyicil seserahan': 'Prepare gifts (Seserahan)',
  'Fiksasi seserahan': 'Finalize gifts (Seserahan)',
  'Menyicil mahar': 'Prepare dowry (Mahar)',
  'Fiksasi mahar': 'Finalize dowry (Mahar)',
  'Menghias mahar': 'Decorate dowry',
  'Survey cincin': 'Survey rings',
  'Fiksasi cincin': 'Finalize rings',
  
  'Survey WO': 'Survey WO',
  'Fiksasi WO': 'Finalize WO',
  'Down paid WO': 'Pay WO down payment',
  'Menyusun rundown acara': 'Draft event rundown',
  'Meeting 1 dengan WO': 'Meeting 1 with WO',
  'Meeting 2 dengan WO': 'Meeting 2 with WO',
  'Family meeting dengan WO': 'Family meeting with WO',
  'Pelunasan WO': 'Pay WO final balance',
  'Gladi resik': 'Final Rehearsal',

  'Survey venue': 'Survey venue',
  'Fiksasi venue': 'Finalize venue',
  'Down paid venue': 'Pay venue down payment',
  'Visit venue': 'Visit venue',
  'Membuat layout acara': 'Create event layout',
  'Pelunasan venue': 'Pay venue final balance',

  'Fotokopi keperluan dokumen CPP (KTP, KK, dll)': 'Copy Groom documents (ID, Family Card, etc)',
  'Fotokopi keperluan dokumen CPW (KTP, KK, dll)': 'Copy Bride documents (ID, Family Card, etc)',
  'Fotokopi KTP orang tua CPP': 'Copy Groom parents ID',
  'Fotokopi KTP orang tua CPW': 'Copy Bride parents ID',
  'Vaksin tetanus': 'Tetanus vaccine',
  'Surat keterangan sehat': 'Health certificate',
  'Surat keterangan belum menikah': 'Certificate of unmarried status',
  'Surat pengantar nikah kelurahan setempat': 'Marriage cover letter from local sub-district',
  'Pas foto': 'Passport photos',
  'Pendaftaran ke KUA': 'Registration at KUA',

  'Survey catering': 'Survey catering',
  'Fiksasi catering': 'Finalize catering',
  'Test food pertama': 'First food tasting',
  'Test food final': 'Final food tasting',
  'Down paid catering': 'Pay catering down payment',
  'Pelunasan catering': 'Pay catering final balance',

  'Survey vendor dekorasi': 'Survey decoration vendors',
  'Fiksasi vendor dekorasi': 'Finalize decoration vendor',
  'Down paid dekorasi': 'Pay decoration down payment',
  'Meeting dengan dekorasi': 'Meeting with decoration vendor',
  'Finalisasi konsep dekorasi': 'Finalize decoration concept',
  'Pelunasan dekorasi': 'Pay decoration final balance',
  'Load in dekorasi di venue': 'Load in decoration at venue',

  'Survey vendor attire': 'Survey attire vendors',
  'Fiksasi vendor attire': 'Finalize attire vendor',
  'Down paid attire': 'Pay attire down payment',
  'Fitting attire 1': 'Attire fitting 1',
  'Fitting attire 2': 'Attire fitting 2',
  'Fitting final attire': 'Final attire fitting',
  'Pelunasan attire': 'Pay attire final balance',

  'Survey MUA': 'Survey MUA',
  'Fiksasi MUA': 'Finalize MUA',
  'Down paid MUA': 'Pay MUA down payment',
  'Pelunasan MUA': 'Pay MUA final balance',

  'Survey photographer': 'Survey photographer',
  'Survey videographer': 'Survey videographer',
  'Survey live streamer': 'Survey live streamer',
  'Fiksasi photographer': 'Finalize photographer',
  'Fiksasi videographer': 'Finalize videographer',
  'Fiksasi live streamer': 'Finalize live streamer',
  'Finalisasi konsep dokumentasi': 'Finalize documentation concept',
  'Down paid vendor dokumentasi': 'Pay documentation down payment',
  'Photoshoot pre-wedding': 'Pre-wedding photoshoot',
  'Pelunasan vendor dokumentasi': 'Pay documentation final balance',

  'Survey vendor entertainment': 'Survey entertainment vendors',
  'Survey MC': 'Survey MC',
  'Fiksasi vendor entertainment': 'Finalize entertainment vendor',
  'Fiksasi MC': 'Finalize MC',
  'Down paid vendor entertainment': 'Pay entertainment down payment',
  'Down paid MC': 'Pay MC down payment',
  'Pelunasan vendor entertainment': 'Pay entertainment final balance',
  'Pelunasan MC': 'Pay MC final balance',

  'Survey vendor undangan digital': 'Survey digital invitation vendors',
  'Survey vendor cetak undangan fisik': 'Survey physical invitation vendors',
  'Fiksasi vendor undangan digital': 'Finalize digital invitation vendor',
  'Fiksasi vendor undangan fisik': 'Finalize physical invitation vendor',
  'Finalisasi jumlah tamu regular & VIP': 'Finalize regular & VIP guest count',
  'Desain undangan': 'Invitation design',
  'Bayar vendor undangan': 'Pay invitation vendor',
  'Menyebarkan undangan': 'Distribute invitations',

  'Survey vendor photobooth': 'Survey photobooth vendor',
  'Fiksasi vendor photobooth': 'Finalize photobooth vendor',
  'Bayar vendor photobooth': 'Pay photobooth vendor',
  'Menentukan souvenir': 'Determine souvenirs',
  'Beli souvenir': 'Buy souvenirs',
  'Survey destinasi honeymoon': 'Survey honeymoon destinations',
  'Booking destinasi honeymoon': 'Book honeymoon destination',
};

export const enToIdTasks = Object.entries(idToEnTasks).reduce((acc, [id, en]) => {
  acc[en] = id;
  return acc;
}, {});

export const getDynamicTaskTitle = (title, lang) => {
  if (lang === 'en') {
    return idToEnTasks[title] || title;
  } else {
    return enToIdTasks[title] || title;
  }
};

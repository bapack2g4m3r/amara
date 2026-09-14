/**
 * Helper to extract groom (CPP / Pria) and bride (CPW / Wanita) names from wedding profile
 */
export const getPartnerNames = (profile) => {
  if (!profile) {
    return {
      groomName: 'CPP',
      brideName: 'CPW',
      groomDisplay: 'CPP',
      brideDisplay: 'CPW'
    };
  }

  let groom = (profile.groom_name || '').trim();
  let bride = (profile.bride_name || '').trim();

  // If not explicitly set via groom_name / bride_name, deduce from partner_1_name and partner_2_name
  if (!groom || !bride) {
    const p1 = (profile.partner_1_name || '').trim();
    const p2 = (profile.partner_2_name || '').trim();

    if (!groom && p1 && !['partner 1', 'pasangan 1', 'partner'].includes(p1.toLowerCase())) {
      groom = p1;
    }
    if (!bride && p2 && !['partner 2', 'pasangan 2', 'partner'].includes(p2.toLowerCase())) {
      bride = p2;
    }
  }

  return {
    groomName: groom || 'CPP',
    brideName: bride || 'CPW',
    groomDisplay: groom && groom !== 'CPP' ? `${groom} (CPP)` : 'CPP',
    brideDisplay: bride && bride !== 'CPW' ? `${bride} (CPW)` : 'CPW'
  };
};

/**
 * Format PIC badge text for task cards
 */
export const formatTaskPic = (pic, profile) => {
  const { groomName, brideName } = getPartnerNames(profile);
  const normalized = (pic || 'Bersama').trim();

  if (normalized === 'CPP') {
    return `Tugas ${groomName}`;
  }
  if (normalized === 'CPW') {
    return `Tugas ${brideName}`;
  }
  return 'Tugas Bersama';
};

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

  let groom = profile.groom_name?.trim();
  let bride = profile.bride_name?.trim();

  // If not explicitly set via groom_name / bride_name, deduce from partner_1_name and partner_2_name
  if (!groom || !bride) {
    const p1 = (profile.partner_1_name || '').trim();
    const p2 = (profile.partner_2_name || '').trim();

    // If one of the names is Amara (female), deduce accordingly
    if (p1.toLowerCase() === 'amara') {
      if (!bride) bride = p1;
      if (!groom) groom = p2 && p2.toLowerCase() !== 'partner' ? p2 : 'CPP';
    } else if (p2.toLowerCase() === 'amara') {
      if (!bride) bride = p2;
      if (!groom) groom = p1 && p1.toLowerCase() !== 'partner' ? p1 : 'CPP';
    } else {
      // Default fallback: partner_1 = groom (CPP), partner_2 = bride (CPW)
      if (!groom) groom = p1 && p1.toLowerCase() !== 'partner' ? p1 : 'CPP';
      if (!bride) bride = p2 && p2.toLowerCase() !== 'partner' ? p2 : 'CPW';
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
    return `🤵 ${groomName}`;
  }
  if (normalized === 'CPW') {
    return `👰 ${brideName}`;
  }
  return '👥 Bersama';
};

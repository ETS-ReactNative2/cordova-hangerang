const makePoints = (situation) => {
  switch(situation) {
  case 'newuser':
      return {'New User':1000};
      break;
  case 'host-checkin':
      return {'Host Check-In':1000};
      break;
  case 'checkin-invite':
      return {'Crew Check-In @ Invite Hang':250};
      break;
  case 'checkin-friends':
      return {'Crew Check-In @ Friends Hang':200};
      break;
  case 'checkin-public':
      return {'Crew Check-In @ Public Hang':125};
      break;
  }
}

const getPoints = (scenario) => {
  let points = makePoints(scenario);
  return points;
}

export { getPoints };

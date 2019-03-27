const makePoints = (situation) => {
  switch(situation) {
  case 'newuser':
      return {'New User':100};
  case 'host-checkin':
      return {'Host Check-In':100};
  case 'checkin-invite':
      return {'Crew Check-In @ Invite Hang':25};
  case 'checkin-friends':
      return {'Crew Check-In @ Friends Hang':20};
  case 'checkin-public':
      return {'Crew Check-In @ Public Hang':15};
  default:
      break;
  }
}

const getPoints = (scenario) => {
  let points = makePoints(scenario);
  return points;
}

export { getPoints };

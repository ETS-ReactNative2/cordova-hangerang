

render() {
    return (
      <div>
        {this.state.invites && Object.entries(this.state.invites).length > 0 &&
          <Route render={({history}) => (
            <div
              className='user-invites'
              onClick={() => { history.push('/invites') }}
            >
              {Object.entries(this.state.invites).length}
            </div>
          )}/>
        }
        <Menu right pageWrapId={ "page-wrap" } outerContainerId={ "root" } isOpen={this.state.menuOpen}
      onStateChange={(state) => this.handleStateChange(state)}>
          <Link id="hangs" className="menu-item" to="/" onClick={() => this.closeMenu()}>Home</Link>
          <Link id="checkin" className="menu-item" to="/checkin/scan" onClick={() => this.closeMenu()}>Check In</Link>
          <Link id="points" className="menu-item" to={`/points/total`} onClick={() => this.closeMenu()}>Points</Link>
          <Link id="crew" className="menu-item" to={`/crew/all`} onClick={() => this.closeMenu()}>Crew</Link>
          <Link id="groups" className="menu-item" to={`/groups`} onClick={() => this.closeMenu()}>Groups</Link>
          {/*<Link id="crawl" className="menu-item" to={`/crawl/${this.state.uid}`} onClick={() => this.closeMenu()}>Coffee Crawl</Link>*/}
          <a id="logout" className="menu-item" onClick={this.logout}>Log Out</a>
        </Menu>
        <div id="page-wrap" className="main">
        <Route exact path="/" render={() =>
          <div className={'container joyride-step-'+this.state.currentStep }>
                {this.state.hangsReady && this.state.username ?
                <HangForm
                  clearSubmit={this.clearSubmit}
                  handleChange={this.handleChange}
                  handleSubmit={this.handleSubmit}
                  makeHang={this.state.makeHang}
                  setHangVisibility={this.setHangVisibility}
                  setDate={this.setDate}
                  setInvitedGroup={this.setInvitedGroup}
                  setLocation={this.setLocation}
                  setName={this.setName}
                  setSubmit={this.setSubmit}
                  toggleForm={this.toggleForm}
                  toggleSubmit={this.toggleSubmit}
                  visibility={this.state.visibility}
                  datetime={this.state.datetime}
                  location={this.state.location}
                  submit={this.state.submit}
                  title={this.state.title}
                  name={this.state.name}
                  user={this.state.user}
                  username={this.state.username}
                  joyrideType={joyrideType}
                  joyrideOverlay={joyrideOverlay}
                  onClickSwitch={this.onClickSwitch}
                  addSteps={this.addSteps}
                  addTooltip={this.addTooltip}
                 />
                : ''}
                {this.state.hangsReady && !this.state.username && !this.state.user.displayName ?
                  <AddName
                    user={this.state.user}
                    setUserName={this.setUserName}
                  />
                : ''}
                <span>
                {this.state.mode === 'nearby' && this.state.isLive ?
                <Geolocation
                  getlocale={this.getLocale}
                  user={this.state.user}
                  setGeoLocation={this.setGeoLocation}
                  setNearEvents={this.setNearEvents}
                  setAddress={this.setAddress}
                  address={this.state.address}
                />
                : ''}
                </span>
                <section className='display-hang'>
                  {this.state.geoReady &&
                   this.state.mode === 'nearby' &&
                    <div>
                    <ZZomato
                      lat={this.state.geoReady.lat}
                      lng={this.state.geoReady.lng}
                      toggleForm={this.toggleForm}
                      setLocation={this.setLocation}
                      setName={this.setName}
                      setTitle={this.setTitle}
                    />
                    </div>
                  }
                  {this.state.hangs &&
                    this.state.hangsReady &&
                    this.state.geoReady &&
                    this.state.mode === 'nearby' &&
                   <h4 className="center home-header">Things Happening Soon</h4>
                  }
                  {this.state.hangs &&
                    this.state.hangsReady &&
                    this.state.geoReady ?
                    <div className='wrapper hangs'>
                      {this.state.mode === 'hangs' && Hangs }
                      {this.state.mode === 'nearby' && NearHangs }
                      {this.state.mode === 'nearby' && GhostHangs }
                      {this.state.mode === 'today' && TodayHangs }
                      { clearInterval(this.state.mountID) }
                    </div>
                    : <div className="center page-spinner">
                    <i className="fa fa-circle-o-notch fa-spin"></i>
                    </div> }
                  {this.state.visiblehangs === 0 &&
                    this.state.mode === 'hangs' &&
                    //this.state.usernew &&
                    this.state.hangsReady &&
                    !this.state.makeHang &&
                    !this.state.hangKey ?
                    <div className="center">
                      <div className="bubble">Looks like you might be new around these parts.</div>
                      <div><img className="checkin-icon" alt="Cowgirl Avatar" src="data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIj8+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBoZWlnaHQ9IjUxMnB4IiB2aWV3Qm94PSItMTUgMCA1MTIgNTEyLjAwMDgyIiB3aWR0aD0iNTEycHgiPjxwYXRoIGQ9Im04Mi42NTIzNDQgNTEyaDMxNi4zODY3MThjMzAuOTYwOTM4IDAgNDUuNjI1LTM4LjA1MDc4MSAyMi43NjE3MTktNTguOTI5Njg4LTM2LjMwNDY4Ny0zMy4xNTYyNS05NC45MTAxNTYtNjcuOTY0ODQzLTE4MC45NTcwMzEtNjcuOTY0ODQzLTg2LjA0Mjk2OSAwLTE0NC42NDg0MzggMzQuODA4NTkzLTE4MC45NTMxMjUgNjcuOTY0ODQzLTIyLjg2MzI4MSAyMC44Nzg5MDctOC4xOTkyMTkgNTguOTI5Njg4IDIyLjc2MTcxOSA1OC45Mjk2ODh6bTAgMCIgZmlsbD0iI2MzZGZlZCIvPjxwYXRoIGQ9Im0zMjMuNjAxNTYyIDM5Ny4wMTk1MzFjLTI0LjE2Nzk2OC03LjM3MTA5My01MS42NjQwNjItMTEuOTEwMTU2LTgyLjc1NzgxMi0xMS45MTAxNTYtODYuMDQyOTY5IDAtMTQ0LjY0ODQzOCAzNC44MDQ2ODctMTgwLjk1MzEyNSA2Ny45NjA5MzctMjIuODYzMjgxIDIwLjg3ODkwNy04LjIwMzEyNSA1OC45Mjk2ODggMjIuNzYxNzE5IDU4LjkyOTY4OGgxNTguMTkxNDA2YzY2LjE4MzU5NC0yNC43NjE3MTkgODAuMTMyODEyLTgzLjg3ODkwNiA4Mi43NTc4MTItMTE0Ljk4MDQ2OXptMCAwIiBmaWxsPSIjYWZkMGRkIi8+PHBhdGggZD0ibTEyMS44MjQyMTkgMzkxLjc0MjE4OGMtMTguOTAyMzQ0IDE4LjkwMjM0My05OC42Njc5NjkgNjguMDIzNDM3LTExNy41NzAzMTMgNDkuMTE3MTg3LTE4LjkwMjM0NC0xOC45MDIzNDQgMzAuMjE0ODQ0LTk4LjY2Nzk2OSA0OS4xMTcxODgtMTE3LjU3MDMxMyAxOC45MDIzNDQtMTguOTAyMzQzIDQ5LjU1MDc4MS0xOC45MDIzNDMgNjguNDUzMTI1IDAgMTguOTAyMzQzIDE4LjkwMjM0NCAxOC45MDIzNDMgNDkuNTUwNzgyIDAgNjguNDUzMTI2em0wIDAiIGZpbGw9IiNmZjc5NTYiLz48cGF0aCBkPSJtMzU5Ljg2NzE4OCAzOTEuNzQyMTg4YzE4LjkwMjM0MyAxOC45MDIzNDMgOTguNjY3OTY4IDY4LjAyMzQzNyAxMTcuNTcwMzEyIDQ5LjExNzE4NyAxOC45MDIzNDQtMTguOTAyMzQ0LTMwLjIxNDg0NC05OC42Njc5NjktNDkuMTE3MTg4LTExNy41NzAzMTMtMTguOTAyMzQzLTE4LjkwMjM0My00OS41NTA3ODEtMTguOTAyMzQzLTY4LjQ1MzEyNCAwLTE4LjkwMjM0NCAxOC45MDIzNDQtMTguOTAyMzQ0IDQ5LjU1MDc4MiAwIDY4LjQ1MzEyNnptMCAwIiBmaWxsPSIjZmY3OTU2Ii8+PHBhdGggZD0ibTM3MC4zNzEwOTQgMzc3LjExMzI4MWgtMjU5LjA1NDY4OHMtMTI1LjEzNjcxOCA5MC4zMDg1OTQgMTI5LjUyNzM0NCAxMzQuODg2NzE5YzI1NC42Njc5NjktNDQuNTc4MTI1IDEyOS41MjczNDQtMTM0Ljg4NjcxOSAxMjkuNTI3MzQ0LTEzNC44ODY3MTl6bTAgMCIgZmlsbD0iI2Y0NjI2MiIvPjxwYXRoIGQ9Im0zMjMuOTM3NSAzNzcuMTEzMjgxaC0yMTIuNjIxMDk0cy0xMjUuMTM2NzE4IDkwLjMwODU5NCAxMjkuNTI3MzQ0IDEzNC44ODY3MTljOTEuODU5Mzc1LTM0LjM3MTA5NCA4My4wOTM3NS0xMzQuODg2NzE5IDgzLjA5Mzc1LTEzNC44ODY3MTl6bTAgMCIgZmlsbD0iI2Q2NWI1YiIvPjxwYXRoIGQ9Im0xMjYuMjIyNjU2IDI5OS4xMjg5MDZjMCAyOS42NDQ1MzItMjQuMDMxMjUgNTMuNjc1NzgyLTUzLjY3NTc4MSA1My42NzU3ODJzLTUzLjY3NTc4MS0yNC4wMzEyNS01My42NzU3ODEtNTMuNjc1NzgyYzAtMjkuNjQwNjI1IDI0LjAzMTI1LTUzLjY3MTg3NSA1My42NzU3ODEtNTMuNjcxODc1czUzLjY3NTc4MSAyNC4wMzEyNSA1My42NzU3ODEgNTMuNjcxODc1em0wIDAiIGZpbGw9IiNmZmFlYTEiLz48cGF0aCBkPSJtNDYyLjgyMDMxMiAyOTkuMTI4OTA2YzAgMjkuNjQ0NTMyLTI0LjAzMTI1IDUzLjY3NTc4Mi01My42NzU3ODEgNTMuNjc1Nzgycy01My42NzU3ODEtMjQuMDMxMjUtNTMuNjc1NzgxLTUzLjY3NTc4MmMwLTI5LjY0MDYyNSAyNC4wMzEyNS01My42NzE4NzUgNTMuNjc1NzgxLTUzLjY3MTg3NXM1My42NzU3ODEgMjQuMDMxMjUgNTMuNjc1NzgxIDUzLjY3MTg3NXptMCAwIiBmaWxsPSIjZmZjZmMyIi8+PHBhdGggZD0ibTI0MC44NDc2NTYgNDU4LjAyNzM0NGMtOTIuNTY2NDA2IDAtMTY4LjMwMDc4MS03NS43MzQzNzUtMTY4LjMwMDc4MS0xNjguMjk2ODc1di04Ny4zNDM3NWMwLTkyLjU2MjUgNzUuNzM0Mzc1LTE2OC4yOTY4NzUgMTY4LjMwMDc4MS0xNjguMjk2ODc1IDkyLjU2MjUgMCAxNjguMjk2ODc1IDc1LjczNDM3NSAxNjguMjk2ODc1IDE2OC4yOTY4NzV2ODcuMzQzNzVjMCA5Mi41NjI1LTc1LjczNDM3NSAxNjguMjk2ODc1LTE2OC4yOTY4NzUgMTY4LjI5Njg3NXptMCAwIiBmaWxsPSIjZmZlMmQ5Ii8+PHBhdGggZD0ibTI0MC44NDc2NTYgMzQuMDg5ODQ0Yy05Mi41NjY0MDYgMC0xNjguMzAwNzgxIDc1LjczNDM3NS0xNjguMzAwNzgxIDE2OC4yOTY4NzV2ODcuMzQzNzVjMCA2MS41NzgxMjUgMzMuNTM1MTU2IDExNS43MjI2NTYgODMuMjMwNDY5IDE0NS4wNjI1LTguNDE0MDYzLTM4LjcxNDg0NC03LjgyMDMxMy03Ny41MzEyNS00LjM4NjcxOS0xMDkuMDU0Njg4IDMuODE2NDA2LTM1LjAwNzgxMiAyMS4wODk4NDQtNjcuMjMwNDY5IDQ4LjA5Mzc1LTg5Ljg0Mzc1IDU0LjM5MDYyNS00NS41NDI5NjkgNzAuMTkxNDA2LTEzNy40Njg3NSA3NC40ODA0NjktMTk4LjUxMTcxOS0xMC43MTQ4NDQtMi4xNjAxNTYtMjEuNzg5MDYzLTMuMjkyOTY4LTMzLjExNzE4OC0zLjI5Mjk2OHptMCAwIiBmaWxsPSIjZmZjZmMyIi8+PHBhdGggZD0ibTI5MS4yOTI5NjkgMTY0Ljc2NTYyNXMtNzMuODI0MjE5IDk1Ljg5ODQzNy0yMDQuNzAzMTI1IDEyMC42OTkyMTljLTE1LjY2MDE1NiAyLjk2NDg0NC0zMC4zODI4MTMtOC41NDY4NzUtMzEuMDkzNzUtMjQuNDY4NzUtMS4xOTE0MDYtMjYuNTQyOTY5LS4wNzQyMTktNjYuMzUxNTYzIDEyLjI1NzgxMi05Ni4yMzA0NjkuNzg5MDYzLjc4OTA2MyAyMjMuNTM5MDYzIDAgMjIzLjUzOTA2MyAwem0wIDAiIGZpbGw9IiNmZjk0NzgiLz48cGF0aCBkPSJtMzI4LjQxNzk2OSAxNzEuMDg1OTM4czIuODg2NzE5IDc1LjEwNTQ2OCA1OS41NTg1OTMgMTA2LjczNDM3NGMxNi43MTQ4NDQgOS4zMjgxMjYgMzcuNDYwOTM4LTIuMjA3MDMxIDM4LjY1NjI1LTIxLjMxMjUgMS41NTA3ODItMjQuNzY5NTMxLS41NTQ2ODctNTguODI4MTI0LTE3LjQ4ODI4MS04NS40MjE4NzR6bTAgMCIgZmlsbD0iI2ZmOTQ3OCIvPjxwYXRoIGQ9Im0yNzQuNzA3MDMxIDEuNjQ4NDM4Yy0xNC4xMTMyODEgNC40NDkyMTgtMzMuODU5Mzc1IDEwLjc2NTYyNC0zMy44NTkzNzUgMTAuNzY1NjI0cy0xOS43NS02LjMxNjQwNi0zMy44NjMyODEtMTAuNzY1NjI0Yy05LjI5Mjk2OS0yLjkyOTY4OC0xOS40MTAxNTYtMS45Mzc1LTI3Ljg5MDYyNSAyLjg2MzI4MS01My4zMzk4NDQgMzAuMTk5MjE5LTc5LjI1IDc5LjIxMDkzNy05MS4xMDU0NjkgMTExLjIzMDQ2OS02LjQ2ODc1IDE3LjQ3NjU2MiAzLjQ2MDkzOCAzNi43MjY1NjIgMjEuMzk4NDM4IDQxLjc4OTA2MiAyOC4wNTg1OTMgNy45MjE4NzUgNzQuMDExNzE5IDE3LjU1ODU5NCAxMzEuNDYwOTM3IDE3LjU1ODU5NCA1Ny40NDkyMTkgMCAxMDMuMzk4NDM4LTkuNjM2NzE5IDEzMS40NTcwMzItMTcuNTU4NTk0IDE3LjkzNzUtNS4wNjI1IDI3Ljg2NzE4Ny0yNC4zMTI1IDIxLjM5ODQzNy00MS43ODkwNjItMTEuODUxNTYzLTMyLjAxOTUzMi0zNy43NjU2MjUtODEuMDMxMjUtOTEuMTAxNTYzLTExMS4yMzA0NjktOC40ODA0NjgtNC44MDQ2ODgtMTguNjAxNTYyLTUuNzkyOTY5LTI3Ljg5NDUzMS0yLjg2MzI4MXptMCAwIiBmaWxsPSIjYzY4ZDZkIi8+PHBhdGggZD0ibTE2My4xOTE0MDYgMTQuNTk3NjU2Yy00Mi43MTg3NSAzMC4yMTA5MzgtNjQuNTkzNzUgNzIuNDg0Mzc1LTc1LjIwMzEyNSAxMDEuMTQ0NTMyLTYuNDY4NzUgMTcuNDc2NTYyIDMuNDYwOTM4IDM2LjcyNjU2MiAyMS4zOTg0MzggNDEuNzg5MDYyIDI4LjA1ODU5MyA3LjkxNzk2OSA3NC4wMDc4MTIgMTcuNTU4NTk0IDEzMS40NjA5MzcgMTcuNTU4NTk0IDQxLjg5MDYyNSAwIDc3LjY1NjI1LTUuMTI1IDEwNC44NDM3NS0xMC45NzI2NTZ2LTczLjAyNzM0NHMtNjcuNDUzMTI1LTQxLjEzNjcxOS0xMTkuMDUwNzgxLTQ1LjgyODEyNWMtMzUuNjcxODc1LTMuMjQyMTg4LTU0Ljk0OTIxOS0yMC4zOTA2MjUtNjMuNDQ5MjE5LTMwLjY2NDA2M3ptMCAwIiBmaWxsPSIjYjI3ODViIi8+PHBhdGggZD0ibTI0MC44NDc2NTYgNzEuNTExNzE5Yy0xMjMuMTc1NzgxIDAtMTk1LjM5MDYyNSA3MS42NjAxNTYtMjI5LjM1OTM3NSAxMTguMzI0MjE5LTEwLjYxMzI4MSAxNC41NzQyMTggMS42Nzk2ODggMzQuNjc5Njg3IDE5LjQ4NDM3NSAzMS44NDc2NTYgNTEuOTQ1MzEzLTguMjU3ODEzIDE0MC42MjEwOTQtMjAuNTAzOTA2IDIwOS44NzUtMjAuNTAzOTA2IDY5LjI1IDAgMTU3LjkyNTc4MiAxMi4yNDYwOTMgMjA5Ljg3MTA5NCAyMC41MDM5MDYgMTcuODA0Njg4IDIuODMyMDMxIDMwLjA5NzY1Ni0xNy4yNzM0MzggMTkuNDg0Mzc1LTMxLjg0NzY1Ni0zMy45Njg3NS00Ni42NjQwNjMtMTA2LjE4MzU5NC0xMTguMzI0MjE5LTIyOS4zNTU0NjktMTE4LjMyNDIxOXptMCAwIiBmaWxsPSIjZGQ5ZjgwIi8+PHBhdGggZD0ibTI0MC44NDc2NTYgNzEuNTExNzE5Yy0xMjMuMTc1NzgxIDAtMTk1LjM5MDYyNSA3MS42NjAxNTYtMjI5LjM1OTM3NSAxMTguMzI0MjE5LTEwLjYxMzI4MSAxNC41NzQyMTggMS42Nzk2ODggMzQuNjc5Njg3IDE5LjQ4NDM3NSAzMS44NDc2NTYgMzcuNjQwNjI1LTUuOTg0Mzc1IDk0LjU1ODU5NC0xNC4wNTg1OTQgMTQ5LjQwNjI1LTE4LjA1NDY4OC03LjY5OTIxOC0xMS40NDE0MDYtMTMuODc4OTA2LTI3LjE3OTY4Ny0xNC44OTg0MzctNDguNjAxNTYyLTIuOTkyMTg4LTYyLjg1NTQ2OSA3NS4zNjcxODctODMuNTE1NjI1IDc1LjM2NzE4Ny04My41MTU2MjV6bTAgMCIgZmlsbD0iI2M2OGQ2ZCIvPjxwYXRoIGQ9Im0yNDAuODQzNzUgMzUyLjY2Nzk2OWMtMTUuOTg4MjgxIDAtMjguOTQ1MzEyLTEyLjk2MDkzOC0yOC45NDUzMTItMjguOTQ5MjE5di0yMS4wNDY4NzVjMC00LjM2MzI4MSAzLjUzNTE1Ni03LjkwMjM0NCA3LjkwMjM0My03LjkwMjM0NGg0Mi4wODk4NDRjNC4zNjcxODcgMCA3LjkwMjM0NCAzLjUzOTA2MyA3LjkwMjM0NCA3LjkwMjM0NHYyMS4wNDY4NzVjMCAxNS45ODgyODEtMTIuOTYwOTM4IDI4Ljk0OTIxOS0yOC45NDkyMTkgMjguOTQ5MjE5em0wIDAiIGZpbGw9IiM1NzU2NWMiLz48cGF0aCBkPSJtMTc0Ljg5MDYyNSAzMjMuNzE4NzVjMC0xMy41NzgxMjUtMTMuODI0MjE5LTI0LjU4OTg0NC0zMC44Nzg5MDYtMjQuNTg5ODQ0LTE3LjA1MDc4MSAwLTMwLjg3NSAxMS4wMTE3MTktMzAuODc1IDI0LjU4OTg0NCAwIDEzLjU4MjAzMSAxMy44MjQyMTkgMjQuNTg5ODQ0IDMwLjg3NSAyNC41ODk4NDQgMTcuMDU0Njg3IDAgMzAuODc4OTA2LTExLjAwNzgxMyAzMC44Nzg5MDYtMjQuNTg5ODQ0em0wIDAiIGZpbGw9IiNmZmE2YmIiLz48cGF0aCBkPSJtMzY4LjU1NDY4OCAzMjMuNzE4NzVjMC0xMy41NzgxMjUtMTMuODI0MjE5LTI0LjU4OTg0NC0zMC44Nzg5MDctMjQuNTg5ODQ0LTE3LjA1MDc4MSAwLTMwLjg3NSAxMS4wMTE3MTktMzAuODc1IDI0LjU4OTg0NCAwIDEzLjU4MjAzMSAxMy44MjQyMTkgMjQuNTg5ODQ0IDMwLjg3NSAyNC41ODk4NDQgMTcuMDU0Njg4IDAgMzAuODc4OTA3LTExLjAwNzgxMyAzMC44Nzg5MDctMjQuNTg5ODQ0em0wIDAiIGZpbGw9IiNmZmE2YmIiLz48ZyBmaWxsPSIjNTc1NjVjIj48cGF0aCBkPSJtMzIzLjkzNzUgMzEwLjIyMjY1NmMtNC4yNjk1MzEgMC03LjcyNjU2Mi0zLjQ2MDkzNy03LjcyNjU2Mi03LjcyNjU2MnYtMTIuODI4MTI1YzAtNC4yNjU2MjUgMy40NTcwMzEtNy43MjY1NjMgNy43MjY1NjItNy43MjY1NjMgNC4yNjU2MjUgMCA3LjcyMjY1NiAzLjQ2MDkzOCA3LjcyMjY1NiA3LjcyNjU2M3YxMi44MjgxMjVjMCA0LjI2NTYyNS0zLjQ1NzAzMSA3LjcyNjU2Mi03LjcyMjY1NiA3LjcyNjU2MnptMCAwIi8+PHBhdGggZD0ibTE1Ny43NTM5MDYgMzEwLjIyMjY1NmMtNC4yNjU2MjUgMC03LjcyNjU2Mi0zLjQ2MDkzNy03LjcyNjU2Mi03LjcyNjU2MnYtMTIuODI4MTI1YzAtNC4yNjU2MjUgMy40NjA5MzctNy43MjY1NjMgNy43MjY1NjItNy43MjY1NjMgNC4yNjk1MzIgMCA3LjcyNjU2MyAzLjQ2MDkzOCA3LjcyNjU2MyA3LjcyNjU2M3YxMi44MjgxMjVjMCA0LjI2NTYyNS0zLjQ1NzAzMSA3LjcyNjU2Mi03LjcyNjU2MyA3LjcyNjU2MnptMCAwIi8+PC9nPjwvc3ZnPgo=" />
                      </div>
                      <div className='welcome-buttons'>
                        <a className="btn blue" onClick={() => this.setMode('nearby')}>
                          <span><i className="fa fa-map-marker white"></i> <b>See</b>{" what's happening "}<b>Nearby</b></span>
                        </a>
                        <a className="btn pink" onClick={() => this.toggleForm()}>
                          <span><i className="fa fa-plus white"></i> <b>Make</b> a quick <b>Hang</b></span>
                        </a>
                      </div>
                    </div>
                  : ''}
                </section>
        <MuiThemeProvider>
          <BottomNav
           hideForm={this.hideForm}
           setMode={this.setMode}
           setSelectedIndex={this.setSelectedIndex}
           selectedIndex={this.state.selectedIndex}
           toggleForm={this.toggleForm}
          />
        </MuiThemeProvider>
        </div> } />
      )
  }

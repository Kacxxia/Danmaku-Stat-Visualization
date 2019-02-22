const p = `type@=online_noble_list/num@=183/rid@=633019/nl@=uid@AA=928925@ASnn@AA=路飞丶丶@ASicon@AA=avatar_v3@AAS201902@AAS5f5b3419ddbb4d6cace5c45f449425c1@ASne@AA=4@ASlv@AA=56@ASrk@AA=44@ASpg@AA=1@ASrg@AA=1@ASsahf@AA=0@AS@Suid@AA=14644827@ASnn@AA=Ares丶兔子@ASicon@AA=avatar_v3@AAS201902@AASd269db26368387612cde588e88c3b60c@ASne@AA=3@ASlv@AA=39@ASrk@AA=33@ASpg@AA=1@ASrg@AA=1@ASsahf@AA=0@AS@Suid@AA=88158545@ASnn@AA=SQSQGOD@ASicon@AA=avanew@AASface@AAS201611@AAS22@AAS09@AAS2a4706101c8ae5ddb1e8146cf380f8f5@ASne@AA=3@ASlv@AA=31@ASrk@AA=33@ASpg@AA=1@ASrg@AA=1@ASsahf@AA=0@AS@Suid@AA=26860960@ASnn@AA=若是前生未有缘@ASicon@AA=avatar_v3@AAS201901@AAS0317cd2dfe0a44fd967bb39bc779a3dd@ASne@AA=2@ASlv@AA=48@ASrk@AA=22@ASpg@AA=1@ASrg@AA=1@ASsahf@AA=0@AS@Suid@AA=87446600@ASnn@AA=炉石小菜鸡啊@ASicon@AA=avatar_v3@AAS201901@AAS2a247d3da01b49b6a5f3e2a6d3ceb622@ASne@AA=2@ASlv@AA=33@ASrk@AA=22@ASpg@AA=1@ASrg@AA=1@ASsahf@AA=0@AS@Suid@AA=1695590@ASnn@AA=青蛙御林军内务总
管@ASicon@AA=avatar@AAS001@AAS69@AAS55@AAS90_avatar@ASne@AA=1@ASlv@AA=43@ASrk@AA=11@ASpg@AA=1@ASrg@AA=1@ASsahf@AA=0@AS@Suid@AA=192522731@ASnn@AA=故事家的活着大人丶@ASicon@AA=avatar_v3@AAS201902@AAS7947c4aee7af4933a8db1aff50c44801@ASne@AA=1@ASlv@AA=38@ASrk@AA=11@ASpg@AA=1@ASrg@AA=1@ASsahf@AA=0@AS@Suid@AA=27601107@ASnn@AA=二十右@ASicon@AA=avatar@AASface@AAS201605@AAS10@AAS716506ba6a5e43716fabda0d8d341b3b@ASne@AA=1@ASlv@AA=35@ASrk@AA=11@ASpg@AA=1@ASrg@AA=1@ASsahf@AA=0@AS@Suid@AA=55151556@ASnn@AA=urbanKing23@ASicon@AA=avanew@AASface@AAS201708@AAS14@AAS18@AAS43fd79a81bd57f6e4ef9743af8db02bd@ASne@AA=1@ASlv@AA=32@ASrk@AA=11@ASpg@AA=1@ASrg@AA=1@ASsahf@AA=0@AS@Suid@AA=11738093@ASnn@AA=丶墙头等红杏@ASicon@AA=avatar@AAS011@AAS73@AAS80@AAS93_avatar@ASne@AA=1@ASlv@AA=30@ASrk@AA=11@ASpg@AA=1@ASrg@AA=1@ASsahf@AA=0@AS@Suid@AA=154626676@ASnn@AA=欲买桂花同载酒
的Wyc@ASicon@AA=avatar_v3@AAS201901@AASa542f56fe99e44b5bbad4e085c135402@ASne@AA=1@ASlv@AA=29@ASrk@AA=11@ASpg@AA=1@ASrg@AA=1@ASsahf@AA=0@AS@Suid@AA=60246702@ASnn@AA=大周职业舔狗@ASicon@AA=avatar@AASface@AAS201607@AAS24@AAS94790c9bcbaa7193ce785304e28b96b5@ASne@AA=1@ASlv@AA=27@ASrk@AA=11@ASpg@AA=1@ASrg@AA=1@ASsahf@AA=0@AS@Suid@AA=36758554@ASnn@AA=真皮QQ糖@ASicon@AA=avanew@AASface@AAS201804@AAS7a672d82b56594662ddcf8d5c2d3fd4f@ASne@AA=1@ASlv@AA=26@ASrk@AA=11@ASpg@AA=1@ASrg@AA=1@ASsahf@AA=0@AS@Suid@AA=45099111@ASnn@AA=SJ莹@ASicon@AA=avanew@AASface@AAS201703@AAS15@AAS20@AAS8fd871ffe5cfd11520b935cbbfcd8707@ASne@AA=1@ASlv@AA=23@ASrk@AA=11@ASpg@AA=1@ASrg@AA=1@ASsahf@AA=0@AS@Suid@AA=9743892@ASnn@AA=贝贝跟谠走@ASicon@AA=avatar@AAS009@AAS74@AAS38@AAS92_avatar@ASne@AA=1@ASlv@AA=20@ASrk@AA=11@ASpg@AA=1@ASrg@AA=1@ASsahf@AA=0@AS@Suid@AA=49781982@ASnn@AA=82年的
O型血@ASicon@AA=avatar_v3@AAS201812@AAS7811b4b2f32e5b0cf`

function formatData(data) {
  function escape(str) {
    if (typeof str !== "string") {
      throw new Error("Data Must be String")
    }
    let result = ""
    for (let c of str) {
      switch (c) {
        case "@":
          result += "@A"
          break;
        case "/":
          result += "@S"
          break;
        default:
          result += c
      }
    }
    return result
  }
  if (typeof data === "string") return escape(data)

  if (Array.isArray(data)) return data.map((d) => escape(formatData(d))).join("/")

  return Object.keys(data)
          .map((key) => `${escape(key)}@=${escape(formatData(data[key]))}`)
          .join("/") 
}

function parseData(data) {
  function unescape(str) {
    let result = ""
    for (let i=0; i < str.length; i++) {
      if (str)
      if (i+1 < str.length) {
        if (str[i] === "@" && str[i+1] === "A") {
          result += "@"
          i++
          continue;
        }
        if (str[i] === "@" && str[i+1] === "S") {
          result += "/"
          i++
          continue;
      }
      }
      result += str[i]
    }
    return result
  }

  if (data.includes("@=")) {
    let p = data.split("/")
    if (p[p.length - 1] === "") p.pop()
    return p.reduce((acc, entry) => {
      const e = unescape(entry).split("@=")

      acc[e[0]] = parseData(e[1])
      return acc
    }, {})
  }

  if (data.includes("/")) {
    let p = data.split("/")
    if (p[p.length - 1] === "") p.pop()
    return p.map(t => parseData(unescape(t)));
  }
    return data;
}  
// console.log(formatData({
//   a: { b: { c: 1}},
//   d: 2
// }))
// console.log(parseData(formatData({a: {b: "1"}})))
console.log(parseData(p))

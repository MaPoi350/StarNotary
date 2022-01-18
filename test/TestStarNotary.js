const StarNotary = artifacts.require("StarNotary.sol");

var accounts;
var owner;


contract('StarNotary', async (accs) => {
    accounts = accs;
    owner = accounts[0];
    const user1 = accounts[1];
    const user2 = accounts[2];
    const tokenId = 0
    const starPrice = web3.utils.toWei('0.01', 'ether')


it('can Create a Star', async() => {
    let instance = await StarNotary.deployed();
    await instance.createStar('Awesome Star!', tokenId, {from: accounts[0]})
    assert.equal(await instance.tokenIdToStarInfo.call(tokenId), 'Awesome Star!')
});


it('lets user1 put up their star for sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let starId = 1;
    let starPrice = web3.utils.toWei(".01", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    assert.equal(await instance.starsForSale.call(starId), starPrice);
});

it('lets user1 get the funds after the sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 3;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user1);
    await instance.buyStar(starId, {from: user2, value: balance});
    let balanceOfUser1AfterTransaction = await web3.eth.getBalance(user1);
    let value1 = Number(balanceOfUser1BeforeTransaction) + Number(starPrice);
    let value2 = Number(balanceOfUser1AfterTransaction);
    assert.equal(value1, value2);
});

it('lets user2 buy a star, if it is put up for sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 4;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(starId, {from: user2, value: balance});
    assert.equal(await instance.ownerOf.call(starId), user2);
});

it('lets user2 buy a star and decreases its balance in ether', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 5;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    const balanceOfUser2BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(starId, {from: user2, value: balance, gasPrice:0});
    const balanceAfterUser2BuysStar = await web3.eth.getBalance(user2);
    let value = Number(balanceOfUser2BeforeTransaction) - Number(balanceAfterUser2BuysStar);
    assert.equal(value, starPrice);
  });

  it('has a token name and symbol', async () => {
    const instance = await StarNotary.deployed()
    assert.equal(await instance.name.call(), 'Mattanna')
    assert.equal(await instance.symbol.call(), 'MNA')
  })

  it('lets 2 users exchange their stars (provided they mutually approved each other)', async () => {
    const user1 = accounts[1];
    const user2 = accounts[2];
    let instance = await StarNotary.deployed()
    await instance.createStar('Star1', 11, { from: user1 })
    await instance.createStar('Star2', 12, { from: user2 })
    // Approve user1 to transfer token of user2
    await instance.approve(user1, 12, { from: user2 })
    // swap stars
    await instance.exchangeStars(11, 12, { from: user1 })
    assert.equal(await instance.ownerOf(11), user2)
    assert.equal(await instance.ownerOf(12), user1)
   })

   it('can transfer a token to another address', async () => {
    const user1 = accounts[1];
    const instance = await StarNotary.deployed()
    await instance.createStar('StarToTransfer', 23, { from: owner })
    await instance.approve(user2, 23, { from: owner })
    // transfer to user 2
    await instance.transfer(user2, 23)
    assert.equal(await instance.ownerOf(23), user2)
    })
});
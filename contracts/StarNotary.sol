pragma solidity >=0.4.24;

import "../node_modules/openzeppelin-solidity/contracts/token/ERC721/ERC721.sol";

contract StarNotary is ERC721 {

    struct Star {
        string name;
    }
    string public name = "Mattanna";
    string public symbol = "MNA";

    mapping(uint256 => Star) public tokenIdToStarInfo;
    mapping(uint256 => uint256) public starsForSale;

    event starCreated(address owner, uint256 _tokenId, string name);
    event starSale(address seller, uint256 _tokenId, uint256 _price);
    event starPurchase(address buyer, uint256 _tokenId, uint256 _price);
    event starExchange(uint256 _tokenId1, uint256 _tokenId2);
    event starTransfer(address to, uint256 _tokenId);

    // Create Star using the Struct
    function createStar(string memory _name, uint256 _tokenId) public { // Passing the name and tokenId as a parameters
        Star memory newStar = Star(_name); // Star is an struct so we are creating a new Star
        tokenIdToStarInfo[_tokenId] = newStar; // Creating in memory the Star -> tokenId mapping
        _mint(msg.sender, _tokenId); // _mint assign the the star with _tokenId to the sender address (ownership)
        emit starCreated(msg.sender, _tokenId, _name);
    }

    // Putting an Star for sale (Adding the star tokenid into the mapping starsForSale, first verify that the sender is the owner)
    function putStarUpForSale(uint256 _tokenId, uint256 _price) public {
        require(ownerOf(_tokenId) == msg.sender, "You can't sale the Star you don't owned");
        starsForSale[_tokenId] = _price;
        emit starSale(msg.sender, _tokenId, _price);
    }


    // Function that allows you to convert an address into a payable address
    function _make_payable(address x) internal pure returns (address payable) {
        return address(uint160(x));
    }

    function buyStar(uint256 _tokenId) public  payable {
        require(starsForSale[_tokenId] > 0, "The Star should be up for sale");
        uint256 starCost = starsForSale[_tokenId];
        address ownerAddress = ownerOf(_tokenId);
        require(msg.value > starCost, "You need to have enough Ether");
        _transferFrom(ownerAddress, msg.sender, _tokenId); // We can't use _addTokenTo or_removeTokenFrom functions, now we have to use _transferFrom
        address payable ownerAddressPayable = _make_payable(ownerAddress); // We need to make this conversion to be able to use transfer() function to transfer ethers
        ownerAddressPayable.transfer(starCost);
        if(msg.value > starCost) {
            msg.sender.transfer(msg.value - starCost);
        }
        emit starPurchase(msg.sender, _tokenId, msg.value);
    }

    // Function that looks up the stars using the Token ID, and then returns the name of the star.
    
    function lookUptokenIdToStarInfo (uint _tokenId) public view returns (string memory) {
        //1. You should return the Star saved in tokenIdToStarInfo mapping
        Star memory lookup = tokenIdToStarInfo[_tokenId];
        string memory name = lookup.name;
        return name ;
    }

    function exchangeStars(uint256 _tokenId1, uint256 _tokenId2) public {
        address user1 = ownerOf(_tokenId1);
        address user2 = ownerOf(_tokenId2);
        // transfer token1 to user2
        safeTransferFrom(user1, user2, _tokenId1);
        // transfer token2 to user1
        safeTransferFrom(user2, user1, _tokenId2);
        emit starExchange(_tokenId1, _tokenId2);
    }

    // Function to Transfer a Star from the address of the caller to destination address
    function transfer(address to, uint256 _tokenId) public {
    safeTransferFrom(msg.sender, to, _tokenId);
    emit starTransfer(to, _tokenId);
  }
}
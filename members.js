/* ============================================
   members.js - Part 1
   Initialization + LocalStorage + Member ID
============================================ */

let members = JSON.parse(localStorage.getItem("mgvm_members")) || [];

const memberForm = document.getElementById("memberForm");
const memberTableBody = document.getElementById("memberTableBody");

const memberId = document.getElementById("memberId");
const memberName = document.getElementById("memberName");
const mobile = document.getElementById("mobile");
const wadi = document.getElementById("wadi");
const dob = document.getElementById("dob");
const address = document.getElementById("address");
const photo = document.getElementById("photo");

const searchMember = document.getElementById("searchMember");
const wadiFilter = document.getElementById("wadiFilter");

/* ============================================
   Auto Member ID
============================================ */

function generateMemberId(){

    let next = members.length + 1;

    memberId.value =
    "MGVM-" +
    String(next).padStart(4,"0");

}

/* ============================================
   Save LocalStorage
============================================ */

function saveMembers(){

    localStorage.setItem(
        "mgvm_members",
        JSON.stringify(members)
    );

}

/* ============================================
   Image To Base64
============================================ */

function imageToBase64(file){

    return new Promise((resolve)=>{

        if(!file){

            resolve("");

            return;

        }

        const reader = new FileReader();

        reader.onload = e=>{

            resolve(e.target.result);

        };

        reader.readAsDataURL(file);

    });

}

/* ============================================
   Reset Form
============================================ */

function resetMemberForm(){

    memberForm.reset();

    generateMemberId();

}

/* ============================================
   Page Load
============================================ */

window.onload = function(){

    generateMemberId();

    displayMembers();

};

/* ============================================
   members.js - Part 2
   Save Member + Duplicate Validation
============================================ */

memberForm.addEventListener("submit", async function(e){

    e.preventDefault();

    /* Duplicate Check */

    const duplicate = members.find(m =>
        m.name.trim().toLowerCase() ===
        memberName.value.trim().toLowerCase()
    );

    if(duplicate){

        alert("हा सभासद आधीपासून नोंदणीकृत आहे.");

        return;

    }

    /* Photo */

    const photoData = await imageToBase64(
        photo.files[0]
    );

    /* Member Object */

    const member = {

        id: memberId.value,

        name: memberName.value.trim(),

        mobile: mobile.value.trim(),

        wadi: wadi.value,

        dob: dob.value,

        address: address.value.trim(),

        photo: photoData,

        subscriptionPending: 0,

        createdDate: new Date().toLocaleDateString("mr-IN")

    };

    members.push(member);

    saveMembers();

    displayMembers();

    showToast("सभासद यशस्वीरित्या जतन झाला.");

    resetMemberForm();

});

/* ============================================
   Toast Message
============================================ */

function showToast(message){

    const toast =
    document.getElementById("toast");

    if(!toast){

        alert(message);

        return;

    }

    toast.innerHTML = message;

    toast.style.display = "block";

    setTimeout(function(){

        toast.style.display = "none";

    },2500);

}


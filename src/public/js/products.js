
console.log("Products frontend javascript file");

$(function () {
    $("#process-btn").on("click", () =>{
        $(".dish-container").slideToggle(500);
        $("#process-btn").css("display","none");
    });

     $("#cancel-btn").on("click", () =>{
        $(".dish-container").slideToggle(300);
        $("#process-btn").css("display","flex");
    });

    $(".new-product-status").on("change", async function (e) {
        const id = e.target.id;
        const productStatus = $(`#${id}.new-product-status`).val();

        try{
            const response = await axios.post(`/admin/product/${id}`, {productStatus: productStatus});
            console.log("response", response);
            const result = response.data;
            if (result.data) {
                 $(".new-product-status").blur();
            } else alert ("Product update failed!")
        } catch (err) {
            console.log(err);
            alert("Product update failed");
        }
    });

    // ===== Delete listing (soft delete) =====
    $(".pn-icon-btn.delete").on("click", async function () {
        const btn = $(this);
        const id = btn.data("id");
        const name = btn.data("name");

        const confirmed = await Swal.fire({
            title: "Delete listing?",
            html: `<b>${name}</b> will be removed from the store.`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, delete",
            cancelButtonText: "Cancel",
            confirmButtonColor: "#e11d48",
            reverseButtons: true,
        });
        if (!confirmed.isConfirmed) return;

        try {
            const response = await axios.post(`/admin/product/${id}`, { productStatus: "DELETE" });
            if (response.data && response.data.data) {
                btn.closest("tr").fadeOut(300, function () { $(this).remove(); });
                Swal.fire({
                    toast: true, position: "top-end", icon: "success",
                    title: "Listing deleted", showConfirmButton: false, timer: 2000, timerProgressBar: true,
                });
            } else {
                Swal.fire("Error", "Delete failed", "error");
            }
        } catch (err) {
            console.log(err);
            Swal.fire("Error", "Delete failed", "error");
        }
    });

    // ===== Edit listing (modal form) =====
    $(".pn-icon-btn.edit").on("click", async function () {
        const btn = $(this);
        const id = btn.data("id");
        const name = btn.data("name");
        const price = btn.data("price");
        const status = btn.data("status");

        const { value: formValues } = await Swal.fire({
            title: "Edit Listing",
            html:
                `<input id="swal-name" class="swal2-input" placeholder="Name" />` +
                `<input id="swal-price" type="number" class="swal2-input" placeholder="Price (₩)" />` +
                `<select id="swal-status" class="swal2-select">` +
                `<option value="PROCESS">PROCESS</option>` +
                `<option value="PAUSE">PAUSE</option>` +
                `</select>`,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: "Save",
            cancelButtonText: "Cancel",
            confirmButtonColor: "#1f9d57",
            reverseButtons: true,
            didOpen: function () {
                document.getElementById("swal-name").value = name != null ? name : "";
                document.getElementById("swal-price").value = price != null ? price : "";
                document.getElementById("swal-status").value = status || "PROCESS";
            },
            preConfirm: function () {
                const productName = document.getElementById("swal-name").value.trim();
                const productPrice = document.getElementById("swal-price").value;
                const productStatus = document.getElementById("swal-status").value;
                if (!productName || productPrice === "") {
                    Swal.showValidationMessage("Please fill all fields");
                    return false;
                }
                return {
                    productName: productName,
                    productPrice: Number(productPrice),
                    productStatus: productStatus,
                };
            },
        });
        if (!formValues) return;

        try {
            const response = await axios.post(`/admin/product/${id}`, formValues);
            if (response.data && response.data.data) {
                Swal.fire({
                    toast: true, position: "top-end", icon: "success",
                    title: "Listing updated", showConfirmButton: false, timer: 1600, timerProgressBar: true,
                });
                setTimeout(function () { window.location.reload(); }, 900);
            } else {
                Swal.fire("Error", "Update failed", "error");
            }
        } catch (err) {
            console.log(err);
            Swal.fire("Error", "Update failed", "error");
        }
    });
});

function validateForm() {
    const productName = $(".product-name").val();
    const productPrice = $(".product-price").val();
    const productCollection = $(".product-collection").val();
    const productDesc = $(".product-desc").val();
    const productStatus = $(".product-status").val();

    if(
    productName === "" ||
    productPrice === "" ||
    productCollection === "" ||
    productDesc === "" ||
    productStatus === ""
    ) {
        alert(" Please insert all required inputs ");
        return false;
    } else return true
}

function previewFileHandler(input, order) {
    const imgClassName = input.className;
    console.log("input:", input);
   
    const file = $(`.${imgClassName}`).get(0).files[0];
    const fileType = file["type"];
    const validImageType = ["image/jpg", "image/jpeg", "image/png"];
    if(!validImageType.includes(fileType)) {
        alert ("Insert only jpeg, jpg and png !");
    } else 
        if (file) {
            const reader = new FileReader();
            reader.onload = function() {
                $(`#image-section-${order}`).attr("src", reader.result);
            };
            reader.readAsDataURL(file);
        }

}
<script lang="ts">
  import ConfirmationModal from '$lib/components/ConfirmationModal.svelte';
  
  let showModal = $state(false);
  
  function handleConfirm() {
    console.log('Confirmed!');
    alert('Confirmed!');
  }
  
  function handleCancel() {
    console.log('Cancelled!');
  }
  
  function openModal() {
    console.log('Opening modal...');
    showModal = true;
    console.log('Modal state:', showModal);
  }
</script>

<div class="p-8">
  <h1 class="text-3xl font-bold mb-4">Modal Test Page</h1>
  
  <div class="space-y-4">
    <div>
      <p>Modal State: <strong>{showModal ? 'OPEN' : 'CLOSED'}</strong></p>
    </div>
    
    <button
      onclick={openModal}
      class="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold"
    >
      Open Delete Modal
    </button>
    
    <button
      onclick={() => showModal = !showModal}
      class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
    >
      Toggle Modal (Current: {showModal})
    </button>
  </div>
</div>

<ConfirmationModal
  bind:isOpen={showModal}
  title="Delete Course"
  message="Are you sure you want to delete this course? This action cannot be undone."
  confirmText="Delete"
  cancelText="Cancel"
  variant="danger"
  onConfirm={handleConfirm}
  onCancel={handleCancel}
/>

<style>
  /* Ensure modal appears on top of everything */
  :global(body) {
    position: relative;
  }
</style>

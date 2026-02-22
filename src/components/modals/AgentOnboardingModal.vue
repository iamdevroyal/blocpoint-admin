<script setup lang="ts">
import { ref, reactive } from 'vue'
import { 
  Building2, 
  User, 
  ShieldCheck, 
  ChevronRight, 
  ChevronLeft,
  Mail,
  Phone,
  Briefcase,
  MapPin
} from 'lucide-vue-next'
import BaseModal from './BaseModal.vue'
import BaseButton from '../forms/BaseButton.vue'
import Card from '../misc/Card.vue'

defineProps<{
  show: boolean
}>()

const emit = defineEmits(['close', 'success'])

const currentStep = ref(1)

const form = reactive({
  // Basic Info
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  
  // Business Info
  business_name: '',
  business_type: 'individual',
  business_address: '',
  initial_float: 0,
  
  // Compliance
  tier_requested: 'Tier 1',
  terms_accepted: false
})

const steps = [
  { id: 1, name: 'Personal Information', icon: User },
  { id: 2, name: 'Business Concept', icon: Building2 },
  { id: 3, name: 'Compliance & Floats', icon: ShieldCheck }
]

function handleClose() {
  currentStep.value = 1
  emit('close')
}

function nextStep() {
  if (currentStep.value < 3) currentStep.value++
  else submitForm()
}

function prevStep() {
  if (currentStep.value > 1) currentStep.value--
}

async function submitForm() {
  // Logic to call API via Store (mocked for now)
  console.log('Submitting onboarding form:', form)
  emit('success')
  handleClose()
}
</script>

<template>
  <BaseModal 
    :show="show" 
    title="Onboard New Agent" 
    size="xl" 
    @close="handleClose"
  >
    <!-- Step Indicator -->
    <div class="mb-10 px-4">
      <div class="relative flex justify-between">
        <div class="absolute top-1/2 left-0 w-full h-0.5 bg-white/5 -translate-y-1/2 z-0"></div>
        <div 
          v-for="step in steps" 
          :key="step.id" 
          class="relative z-10 flex flex-col items-center gap-2 group"
        >
          <div 
            :class="[
              'w-10 h-10 rounded-xl flex items-center justify-center border transition-all duration-300',
              currentStep === step.id ? 'bg-indigo-500 border-indigo-400 text-white shadow-lg shadow-indigo-500/20' : 
              currentStep > step.id ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-dark-surface border-white/10 text-slate-600'
            ]"
          >
            <component :is="step.icon" class="w-5 h-5" />
          </div>
          <span :class="['text-[10px] font-bold uppercase tracking-widest', currentStep === step.id ? 'text-white' : 'text-slate-600']">
            {{ step.name }}
          </span>
        </div>
      </div>
    </div>

    <!-- Step 1: Personal Info -->
    <div v-if="currentStep === 1" class="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div class="grid grid-cols-2 gap-4">
        <div class="space-y-2">
          <label class="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">First Name</label>
          <input v-model="form.first_name" type="text" placeholder="John" class="form-input-premium w-full" />
        </div>
        <div class="space-y-2">
          <label class="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Last Name</label>
          <input v-model="form.last_name" type="text" placeholder="Doe" class="form-input-premium w-full" />
        </div>
      </div>

      <div class="space-y-2">
        <label class="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Work Email</label>
        <div class="relative">
          <Mail class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input v-model="form.email" type="email" placeholder="john@doe.com" class="form-input-premium w-full pl-10" />
        </div>
      </div>

      <div class="space-y-2">
        <label class="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Phone Number</label>
        <div class="relative">
          <Phone class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input v-model="form.phone" type="tel" placeholder="+234 800 000 0000" class="form-input-premium w-full pl-10" />
        </div>
      </div>
    </div>

    <!-- Step 2: Business Info -->
    <div v-if="currentStep === 2" class="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div class="space-y-2">
        <label class="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Registered Business Name</label>
        <div class="relative">
          <Briefcase class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input v-model="form.business_name" type="text" placeholder="Doe Retail Enterprises" class="form-input-premium w-full pl-10" />
        </div>
      </div>

      <div class="space-y-2">
        <label class="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Business Type</label>
        <select v-model="form.business_type" class="form-input-premium w-full">
          <option value="individual">Sole Proprietorship / Individual</option>
          <option value="limited">Limited Liability Company (LLC)</option>
          <option value="ngo">Non-Profit / NGO</option>
        </select>
      </div>

      <div class="space-y-2">
        <label class="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Office Address</label>
        <div class="relative">
          <MapPin class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input v-model="form.business_address" type="text" placeholder="123 Business Way, Lagos" class="form-input-premium w-full pl-10" />
        </div>
      </div>
    </div>

    <!-- Step 3: Compliance & Floats -->
    <div v-if="currentStep === 3" class="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <Card padding="p-4" class="bg-indigo-500/5 border-indigo-500/20">
        <div class="flex items-center gap-3 mb-2">
          <ShieldCheck class="w-5 h-5 text-indigo-400" />
          <span class="text-sm font-bold text-white uppercase tracking-wider">Initial Compliance Setting</span>
        </div>
        <p class="text-[10px] text-slate-500 leading-tight">
          Select the starting operational tier. This governs transaction limits and required documentation.
        </p>
      </Card>

      <div class="space-y-2">
        <label class="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Requested Tier</label>
        <select v-model="form.tier_requested" class="form-input-premium w-full">
          <option>Tier 1 (₦500k Limit)</option>
          <option>Tier 2 (₦5M Limit)</option>
          <option>Tier 3 (Unlimited)</option>
        </select>
      </div>

      <div class="space-y-2">
        <label class="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Initial Float Assignment (₦)</label>
        <input v-model="form.initial_float" type="number" step="1000" class="form-input-premium w-full font-mono" />
      </div>

      <div class="flex items-center gap-3 p-1">
        <input v-model="form.terms_accepted" type="checkbox" class="w-4 h-4 bg-white/5 border-white/10 rounded cursor-pointer accent-indigo-500" />
        <span class="text-[10px] text-slate-400">Agent accepts the BlocPoint liquidity management terms and compliance policies.</span>
      </div>
    </div>

    <!-- Footer -->
    <template #footer>
      <BaseButton variant="ghost" @click="handleClose">Cancel</BaseButton>
      <div class="flex items-center gap-2">
        <BaseButton v-if="currentStep > 1" variant="secondary" @click="prevStep">
          <ChevronLeft class="w-4 h-4 mr-2" />
          Back
        </BaseButton>
        <BaseButton variant="primary" @click="nextStep">
          <span class="flex items-center gap-2">
            {{ currentStep === 3 ? 'Deploy Agent' : 'Continue' }}
            <ChevronRight v-if="currentStep < 3" class="w-4 h-4" />
          </span>
        </BaseButton>
      </div>
    </template>
  </BaseModal>
</template>


/**
 * Adds more real medicines to the bundled snapshot.
 * The live janaushadhi.gov.in product API returned HTTP 500 on 2026-10-21,
 * so these rows are a curated extension. MRPs are indicative pack prices.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const jaPath = path.join(root, 'data', 'jan_aushadhi.json');
const brPath = path.join(root, 'data', 'brands.json');
const ja = JSON.parse(fs.readFileSync(jaPath, 'utf8'));
const brands = JSON.parse(fs.readFileSync(brPath, 'utf8'));

const norm = (s) => String(s).toLowerCase().replace(/\s+/g, '');
const keyOf = (salts, strength) => salts.map((s) => s.toLowerCase().trim()).join('|') + '@' + norm(strength);

const have = new Set(ja.map((g) => keyOf(g.salts, g.strength)));
const haveBrand = new Set(brands.map((b) => b.brand.toLowerCase()));
let code = ja.reduce((m, g) => Math.max(m, Number(g.code) || 0), 0);

const extra = [];
const add = (name, salts, strength, form, unit, mrp, group) => {
  const k = keyOf(salts, strength);
  if (have.has(k)) return;
  const parts = String(strength).split('+');
  if (salts.length !== parts.length) throw new Error(`mismatch ${name}`);
  have.add(k);
  extra.push({
    code: String(++code),
    generic_name: name,
    salts,
    strength,
    form,
    unit,
    mrp: +Number(mrp).toFixed(2),
    group,
  });
};

const cap = (s) => s.replace(/\b\w/g, (c) => c.toUpperCase());
const many = (salt, strengths, group, start, form = 'tablet', unit = "10's") => {
  strengths.forEach((strength, i) => {
    const label = form === 'tablet' ? 'Tablets' : form === 'capsule' ? 'Capsules' : form === 'syrup' ? 'Syrup' : cap(form);
    add(`${cap(salt)} ${strength} ${label}`, [salt], strength, form, unit, start + i * 1.5, group);
  });
};

many('cefpodoxime', ['100mg', '200mg'], 'Antibacterial', 28);
many('ceftriaxone', ['250mg', '500mg', '1g'], 'Antibacterial', 22, 'injection', '1 vial');
many('ampicillin', ['250mg', '500mg'], 'Antibacterial', 12, 'capsule');
many('cloxacillin', ['250mg', '500mg'], 'Antibacterial', 14, 'capsule');
many('cotrimoxazole', ['480mg', '960mg'], 'Antibacterial', 8);
many('gentamicin', ['40mg', '80mg'], 'Antibacterial', 6, 'injection', '2ml');
many('amikacin', ['100mg', '250mg', '500mg'], 'Antibacterial', 12, 'injection', '2ml');
many('meropenem', ['500mg', '1g'], 'Antibacterial', 180, 'injection', '1 vial');
many('piperacillin', ['4g'], 'Antibacterial', 90, 'injection', '1 vial');
many('vancomycin', ['500mg', '1g'], 'Antibacterial', 120, 'injection', '1 vial');
many('clindamycin', ['150mg', '300mg'], 'Antibacterial', 22, 'capsule');
many('nitrofurantoin', ['50mg'], 'Antibacterial', 10, 'tablet');
many('fosfomycin', ['3g'], 'Antibacterial', 95, 'powder', '1 sachet');
many('flucloxacillin', ['250mg', '500mg'], 'Antibacterial', 16, 'capsule');
many('cefadroxil', ['250mg', '500mg'], 'Antibacterial', 18, 'capsule');
many('cefdinir', ['300mg'], 'Antibacterial', 45);
many('cefpodoxime', ['50mg/5ml'], 'Antibacterial', 32, 'syrup', '30ml');
many('azithromycin', ['200mg/5ml'], 'Antibacterial', 38, 'syrup', '15ml');
many('amoxicillin', ['125mg/5ml', '250mg/5ml'], 'Antibacterial', 22, 'syrup', '60ml');

many('glipizide', ['2.5mg', '5mg'], 'Antidiabetic', 6);
many('gliclazide', ['30mg', '60mg'], 'Antidiabetic', 14);
many('linagliptin', ['5mg'], 'Antidiabetic', 48);
many('canagliflozin', ['100mg'], 'Antidiabetic', 70);
many('repaglinide', ['0.5mg', '1mg', '2mg'], 'Antidiabetic', 12);
many('acarbose', ['25mg', '50mg'], 'Antidiabetic', 18);
many('insulin', ['40iu/ml'], 'Antidiabetic', 140, 'injection', '10ml');

many('carvedilol', ['3.125mg', '6.25mg', '12.5mg', '25mg'], 'Antihypertensive', 8);
many('bisoprolol', ['2.5mg', '5mg'], 'Antihypertensive', 10);
many('nebivolol', ['2.5mg', '5mg'], 'Antihypertensive', 16);
many('torsemide', ['5mg', '10mg', '20mg'], 'Diuretic', 7);
many('chlorthalidone', ['6.25mg', '12.5mg'], 'Diuretic', 6);
many('indapamide', ['1.5mg'], 'Diuretic', 9);
many('warfarin', ['1mg', '2mg', '5mg'], 'Anticoagulant', 8);
many('rivaroxaban', ['10mg', '15mg', '20mg'], 'Anticoagulant', 55);
many('apixaban', ['2.5mg', '5mg'], 'Anticoagulant', 60);
many('isosorbide dinitrate', ['5mg', '10mg'], 'Antianginal', 6);
many('nicorandil', ['5mg', '10mg'], 'Antianginal', 14);
many('trimetazidine', ['35mg'], 'Antianginal', 18);
many('ivabradine', ['5mg'], 'Antianginal', 22);
many('sacubitril', ['50mg'], 'Cardiac', 40);
many('verapamil', ['40mg', '80mg'], 'Antihypertensive', 8);
many('diltiazem', ['30mg', '60mg'], 'Antihypertensive', 9);
many('clonidine', ['100mcg'], 'Antihypertensive', 7);
many('prazosin', ['2.5mg', '5mg'], 'Antihypertensive', 10);
many('hydralazine', ['25mg'], 'Antihypertensive', 8);
many('labetalol', ['100mg'], 'Antihypertensive', 12);
many('ezetimibe', ['10mg'], 'Hypolipidaemic', 20);
many('fenofibrate', ['145mg'], 'Hypolipidaemic', 18);
many('gemfibrozil', ['300mg'], 'Hypolipidaemic', 16);

many('ondansetron', ['2mg/ml'], 'Antiemetic', 8, 'injection', '2ml');
many('domperidone', ['5mg/5ml'], 'Antiemetic', 16, 'syrup', '30ml');
many('sucralfate', ['1g', '1g/10ml'], 'Antacid/Antiulcerant', 20);
many('racecadotril', ['100mg'], 'Antidiarrhoeal', 18, 'capsule');
many('ors', ['4.1g'], 'Electrolyte', 3, 'powder', '1 sachet');
many('hyoscine', ['10mg'], 'Antispasmodic', 8);
many('itopride', ['50mg'], 'Antiemetic', 16);
many('levosulpiride', ['25mg'], 'Antiemetic', 14);
many('mesalazine', ['400mg', '1.2g'], 'Gastrointestinal', 35);
many('lactulose', ['3.35g/5ml'], 'Laxative', 40, 'syrup', '100ml');
many('polyethylene glycol', ['17g'], 'Laxative', 22, 'powder', '1 sachet');

many('levosalbutamol', ['50mcg'], 'Antiasthmatic', 55, 'inhaler', '200 md');
many('formoterol', ['6mcg'], 'Antiasthmatic', 40, 'inhaler', '120 md');
many('tiotropium', ['9mcg'], 'Antiasthmatic', 80, 'inhaler', '200 md');
many('ipratropium', ['20mcg'], 'Antiasthmatic', 48, 'inhaler', '200 md');
many('budesonide', ['0.5mg'], 'Antiasthmatic', 18, 'solution', '2ml');
many('montelukast', ['4mg'], 'Antiasthmatic', 12);
many('ambroxol', ['15mg/5ml'], 'Expectorant', 22, 'syrup', '100ml');
many('bromhexine', ['4mg', '8mg'], 'Expectorant', 6);
many('dextromethorphan', ['10mg'], 'Cold/Cough', 5);
many('phenylephrine', ['10mg'], 'Cold/Cough', 4);
many('cetirizine', ['5mg/5ml'], 'Antihistamine', 18, 'syrup', '60ml');
many('levocetirizine', ['2.5mg/5ml'], 'Antihistamine', 20, 'syrup', '60ml');
many('fexofenadine', ['60mg'], 'Antihistamine', 14);
many('hydroxyzine', ['10mg', '25mg'], 'Antihistamine', 8);
many('bilastine', ['20mg'], 'Antihistamine', 16);

many('olanzapine', ['2.5mg', '5mg', '10mg'], 'Antipsychotic', 12);
many('risperidone', ['1mg', '2mg'], 'Antipsychotic', 10);
many('quetiapine', ['25mg', '50mg', '100mg'], 'Antipsychotic', 14);
many('aripiprazole', ['5mg', '10mg', '15mg'], 'Antipsychotic', 18);
many('haloperidol', ['1.5mg', '5mg'], 'Antipsychotic', 6);
many('lithium', ['300mg'], 'Mood stabiliser', 12);
many('amitriptyline', ['50mg', '75mg'], 'Antidepressant', 8);
many('duloxetine', ['20mg', '30mg', '60mg'], 'Antidepressant', 16, 'capsule');
many('venlafaxine', ['37.5mg', '75mg'], 'Antidepressant', 15, 'capsule');
many('mirtazapine', ['7.5mg', '15mg'], 'Antidepressant', 14);
many('donepezil', ['5mg', '10mg'], 'Neurology', 20);
many('memantine', ['5mg', '10mg'], 'Neurology', 18);
many('levodopa', ['100mg'], 'Neurology', 16);
many('pramipexole', ['0.25mg', '0.5mg'], 'Neurology', 22);
many('sumatriptan', ['25mg', '50mg'], 'Neurology', 18);
many('propranolol', ['20mg'], 'Antihypertensive', 5);
many('topiramate', ['25mg', '50mg'], 'Antiepileptic', 14);
many('lamotrigine', ['25mg', '50mg', '100mg'], 'Antiepileptic', 16);
many('phenytoin', ['100mg'], 'Antiepileptic', 8);
many('clobazam', ['5mg', '10mg'], 'Antiepileptic', 12);
many('levetiracetam', ['250mg', '750mg'], 'Antiepileptic', 30);
many('sodium valproate', ['200mg/5ml'], 'Antiepileptic', 28, 'syrup', '100ml');
many('pregabalin', ['50mg'], 'Antiepileptic', 18, 'capsule');
many('gabapentin', ['400mg'], 'Antiepileptic', 20, 'capsule');

many('tranexamic acid', ['500mg'], 'Haemostatic', 18);
many('norethisterone', ['5mg'], 'Gynaecology', 12);
many('medroxyprogesterone', ['10mg'], 'Gynaecology', 14);
many('dydrogesterone', ['10mg'], 'Gynaecology', 40);
many('mifepristone', ['200mg'], 'Gynaecology', 35);
many('misoprostol', ['200mcg'], 'Gynaecology', 12);
many('ethinylestradiol', ['0.03mg'], 'Gynaecology', 15);
many('letrozole', ['2.5mg'], 'Gynaecology', 18);
many('clomifene', ['50mg'], 'Gynaecology', 16);

many('tamsulosin', ['0.2mg'], 'Urology', 18, 'capsule');
many('alfuzosin', ['10mg'], 'Urology', 20);
many('dutasteride', ['0.5mg'], 'Urology', 22, 'capsule');
many('solifenacin', ['5mg'], 'Urology', 24);
many('mirabegron', ['25mg', '50mg'], 'Urology', 30);
many('potassium citrate', ['1100mg'], 'Urology', 14);
many('nitrofurantoin', ['100mg'], 'Antibacterial', 18, 'capsule');

many('timolol', ['0.5%'], 'Ophthalmic', 18, 'solution', '5ml');
many('latanoprost', ['0.005%'], 'Ophthalmic', 45, 'solution', '2.5ml');
many('moxifloxacin', ['0.5%'], 'Ophthalmic', 28, 'solution', '5ml');
many('ofloxacin', ['0.3%'], 'Ophthalmic', 16, 'solution', '5ml');
many('carboxymethylcellulose', ['0.5%'], 'Ophthalmic', 20, 'solution', '10ml');
many('olopatadine', ['0.1%'], 'Ophthalmic', 22, 'solution', '5ml');
many('ciprofloxacin', ['0.3%'], 'Ophthalmic', 12, 'solution', '5ml');
many('clotrimazole', ['1%'], 'Dermatology', 14, 'solution', '15ml');

many('adapalene', ['0.1%'], 'Dermatology', 30, 'gel', '15g');
many('clindamycin', ['1%'], 'Dermatology', 24, 'gel', '15g');
many('fusidic acid', ['2%'], 'Dermatology', 28, 'cream', '10g');
many('ketoconazole', ['2%'], 'Dermatology', 22, 'cream', '15g');
many('terbinafine', ['1%'], 'Dermatology', 26, 'cream', '15g');
many('mometasone', ['0.1%'], 'Dermatology', 24, 'cream', '15g');
many('permethrin', ['5%'], 'Dermatology', 20, 'cream', '30g');
many('calamine', ['8%'], 'Dermatology', 12, 'cream', '50g');
many('whitfield', ['3%'], 'Dermatology', 10, 'ointment', '15g');

many('calcium carbonate', ['250mg'], 'Mineral', 8);
many('cholecalciferol', ['1000iu', '2000iu'], 'Vitamin', 10, 'tablet');
many('folic acid', ['1mg'], 'Vitamin', 3);
many('ferrous ascorbate', ['100mg'], 'Haematinic', 12);
many('zinc sulphate', ['10mg'], 'Mineral', 4);
many('magnesium', ['250mg'], 'Mineral', 8);
many('vitamin b12', ['500mcg'], 'Vitamin', 10);
many('thiamine', ['100mg'], 'Vitamin', 6);
many('pyridoxine', ['40mg'], 'Vitamin', 5);
many('biotin', ['5mg'], 'Vitamin', 8);
many('omega 3', ['1000mg'], 'Supplement', 18, 'capsule');

many('acyclovir', ['200mg'], 'Antiviral', 20);
many('oseltamivir', ['75mg'], 'Antiviral', 45, 'capsule');
many('valacyclovir', ['500mg', '1000mg'], 'Antiviral', 40);
many('fluconazole', ['50mg'], 'Antifungal', 6, 'capsule');
many('griseofulvin', ['250mg'], 'Antifungal', 14);
many('nystatin', ['100000iu/ml'], 'Antifungal', 18, 'solution', '30ml');
many('albendazole', ['200mg/5ml'], 'Anthelmintic', 12, 'syrup', '10ml');
many('ivermectin', ['6mg'], 'Anthelmintic', 6);
many('diethylcarbamazine', ['100mg'], 'Anthelmintic', 5);
many('praziquantel', ['600mg'], 'Anthelmintic', 16);

many('allopurinol', ['200mg'], 'Antigout', 10);
many('colchicine', ['0.5mg'], 'Antigout', 8);
many('prednisolone', ['20mg'], 'Corticosteroid', 10);
many('deflazacort', ['6mg', '30mg'], 'Corticosteroid', 14);
many('methylprednisolone', ['4mg', '8mg', '16mg'], 'Corticosteroid', 12);
many('hydrocortisone', ['10mg'], 'Corticosteroid', 8);
many('levothyroxine', ['12.5mcg', '88mcg', '150mcg'], 'Thyroid', 20);
many('carbimazole', ['20mg'], 'Thyroid', 18);
many('methimazole', ['5mg', '10mg'], 'Thyroid', 12);

many('pantoprazole', ['40mg'], 'Antacid/Antiulcerant', 14, 'injection', '1 vial');
many('omeprazole', ['20mg'], 'Antacid/Antiulcerant', 10, 'injection', '1 vial');
many('rabeprazole', ['20mg'], 'Antacid/Antiulcerant', 12, 'injection', '1 vial');
many('paracetamol', ['150mg/ml'], 'Analgesic/Antipyretic/Anti-Inflammatory', 8, 'injection', '2ml');
many('paracetamol', ['250mg'], 'Analgesic/Antipyretic/Anti-Inflammatory', 4);
many('paracetamol', ['1000mg'], 'Analgesic/Antipyretic/Anti-Inflammatory', 12);
many('ibuprofen', ['100mg/5ml'], 'Analgesic/Antipyretic/Anti-Inflammatory', 16, 'syrup', '60ml');
many('diclofenac', ['25mg'], 'Analgesic/Antipyretic/Anti-Inflammatory', 5);
many('aceclofenac', ['200mg'], 'Analgesic/Antipyretic/Anti-Inflammatory', 12);
many('etoricoxib', ['120mg'], 'Analgesic/Antipyretic/Anti-Inflammatory', 22);
many('tramadol', ['100mg'], 'Analgesic/Antipyretic/Anti-Inflammatory', 16);
many('aspirin', ['325mg'], 'Analgesic/Antipyretic/Anti-Inflammatory', 6);
many('nimesulide', ['100mg'], 'Analgesic/Antipyretic/Anti-Inflammatory', 8);

add('Amoxicillin 875mg and Clavulanic Acid 125mg Tablets', ['amoxicillin', 'clavulanic acid'], '875mg+125mg', 'tablet', "6's", 62, 'Antibacterial');
add('Cefpodoxime 200mg and Clavulanic Acid 125mg Tablets', ['cefpodoxime', 'clavulanic acid'], '200mg+125mg', 'tablet', "10's", 85, 'Antibacterial');
add('Glimepiride 1mg and Metformin 1000mg Tablets', ['glimepiride', 'metformin'], '1mg+1000mg', 'tablet', "10's", 16, 'Antidiabetic');
add('Glimepiride 2mg and Metformin 1000mg Tablets', ['glimepiride', 'metformin'], '2mg+1000mg', 'tablet', "10's", 18, 'Antidiabetic');
add('Teneligliptin 20mg and Metformin 500mg Tablets', ['teneligliptin', 'metformin'], '20mg+500mg', 'tablet', "10's", 32, 'Antidiabetic');
add('Sitagliptin 50mg and Metformin 500mg Tablets', ['sitagliptin', 'metformin'], '50mg+500mg', 'tablet', "7's", 48, 'Antidiabetic');
add('Telmisartan 40mg and Chlorthalidone 12.5mg Tablets', ['telmisartan', 'chlorthalidone'], '40mg+12.5mg', 'tablet', "10's", 20, 'Antihypertensive');
add('Amlodipine 5mg and Atenolol 50mg Tablets', ['amlodipine', 'atenolol'], '5mg+50mg', 'tablet', "10's", 14, 'Antihypertensive');
add('Losartan 50mg and Amlodipine 5mg Tablets', ['losartan', 'amlodipine'], '50mg+5mg', 'tablet', "10's", 18, 'Antihypertensive');
add('Atorvastatin 10mg and Aspirin 75mg Capsules', ['atorvastatin', 'aspirin'], '10mg+75mg', 'capsule', "10's", 22, 'Hypolipidaemic');
add('Rosuvastatin 10mg and Aspirin 75mg Capsules', ['rosuvastatin', 'aspirin'], '10mg+75mg', 'capsule', "10's", 28, 'Hypolipidaemic');
add('Montelukast 10mg and Fexofenadine 120mg Tablets', ['montelukast', 'fexofenadine'], '10mg+120mg', 'tablet', "10's", 30, 'Antihistamine');
add('Ambroxol 30mg and Guaifenesin 50mg and Terbutaline 1.25mg Syrup', ['ambroxol', 'guaifenesin', 'terbutaline'], '30mg+50mg+1.25mg', 'syrup', '100ml', 42, 'Expectorant');
add('Diclofenac 50mg and Paracetamol 325mg Tablets', ['diclofenac', 'paracetamol'], '50mg+325mg', 'tablet', "10's", 8, 'Analgesic/Antipyretic/Anti-Inflammatory');
add('Tramadol 37.5mg and Paracetamol 325mg Tablets', ['tramadol', 'paracetamol'], '37.5mg+325mg', 'tablet', "10's", 12, 'Analgesic/Antipyretic/Anti-Inflammatory');
add('Ofloxacin 200mg and Ornidazole 500mg Tablets', ['ofloxacin', 'ornidazole'], '200mg+500mg', 'tablet', "10's", 22, 'Antibacterial');
add('Norfloxacin 400mg and Tinidazole 600mg Tablets', ['norfloxacin', 'tinidazole'], '400mg+600mg', 'tablet', "10's", 18, 'Antibacterial');
add('Artemether 80mg and Lumefantrine 480mg Tablets', ['artemether', 'lumefantrine'], '80mg+480mg', 'tablet', "6's", 48, 'Antimalarial');
add('Artesunate 100mg and Sulfadoxine 500mg and Pyrimethamine 25mg', ['artesunate', 'sulfadoxine', 'pyrimethamine'], '100mg+500mg+25mg', 'tablet', "1 kit", 30, 'Antimalarial');
add('Chloroquine 250mg Tablets', ['chloroquine'], '250mg', 'tablet', "10's", 6, 'Antimalarial');
add('Primaquine 7.5mg Tablets', ['primaquine'], '7.5mg', 'tablet', "10's", 5, 'Antimalarial');
add('Hydroxychloroquine 400mg Tablets', ['hydroxychloroquine'], '400mg', 'tablet', "10's", 36, 'DMARD');
add('Sulfasalazine 500mg Tablets', ['sulfasalazine'], '500mg', 'tablet', "10's", 18, 'DMARD');
add('Leflunomide 10mg Tablets', ['leflunomide'], '10mg', 'tablet', "10's", 22, 'DMARD');
add('Methotrexate 7.5mg Tablets', ['methotrexate'], '7.5mg', 'tablet', "10's", 24, 'DMARD');
add('Calcium 500mg and Vitamin D3 500 IU Tablets', ['calcium carbonate', 'cholecalciferol'], '500mg+500iu', 'tablet', "15's", 22, 'Mineral');
add('Ferrous Sulphate 200mg and Folic Acid 0.5mg Tablets', ['ferrous sulphate', 'folic acid'], '200mg+0.5mg', 'tablet', "10's", 6, 'Haematinic');
add('Budesonide 200mcg and Formoterol 6mcg Inhaler', ['budesonide', 'formoterol'], '200mcg+6mcg', 'inhaler', '120 md', 110, 'Antiasthmatic');
add('Salbutamol 100mcg and Ipratropium 20mcg Inhaler', ['salbutamol', 'ipratropium'], '100mcg+20mcg', 'inhaler', '200 md', 75, 'Antiasthmatic');
add('Pantoprazole 40mg and Itopride 150mg Capsules', ['pantoprazole', 'itopride'], '40mg+150mg', 'capsule', "10's", 28, 'Antacid/Antiulcerant');
add('Rabeprazole 20mg and Itopride 150mg Capsules', ['rabeprazole', 'itopride'], '20mg+150mg', 'capsule', "10's", 26, 'Antacid/Antiulcerant');
add('Telmisartan 80mg and Amlodipine 5mg Tablets', ['telmisartan', 'amlodipine'], '80mg+5mg', 'tablet', "10's", 26, 'Antihypertensive');
add('Metoprolol 25mg and Telmisartan 40mg Tablets', ['metoprolol', 'telmisartan'], '25mg+40mg', 'tablet', "10's", 22, 'Antihypertensive');
add('Cilnidipine 10mg Tablets', ['cilnidipine'], '10mg', 'tablet', "10's", 14, 'Antihypertensive');
add('Cilnidipine 10mg and Telmisartan 40mg Tablets', ['cilnidipine', 'telmisartan'], '10mg+40mg', 'tablet', "10's", 24, 'Antihypertensive');
add('S-Amlodipine 2.5mg Tablets', ['s-amlodipine'], '2.5mg', 'tablet', "10's", 12, 'Antihypertensive');
add('Bisoprolol 5mg and Amlodipine 5mg Tablets', ['bisoprolol', 'amlodipine'], '5mg+5mg', 'tablet', "10's", 18, 'Antihypertensive');
add('Empagliflozin 25mg Tablets', ['empagliflozin'], '25mg', 'tablet', "10's", 85, 'Antidiabetic');
add('Dapagliflozin 5mg Tablets', ['dapagliflozin'], '5mg', 'tablet', "14's", 48, 'Antidiabetic');
add('Vildagliptin 50mg and Metformin 500mg Tablets', ['vildagliptin', 'metformin'], '50mg+500mg', 'tablet', "15's", 42, 'Antidiabetic');
add('Levocetirizine 5mg and Montelukast 10mg Tablets', ['levocetirizine', 'montelukast'], '5mg+10mg', 'tablet', "10's", 20, 'Antihistamine');
add('Aceclofenac 100mg and Serratiopeptidase 15mg Tablets', ['aceclofenac', 'serratiopeptidase'], '100mg+15mg', 'tablet', "10's", 16, 'Analgesic/Antipyretic/Anti-Inflammatory');
add('Trypsin 48mg and Bromelain 90mg and Rutoside 100mg Tablets', ['trypsin', 'bromelain', 'rutoside'], '48mg+90mg+100mg', 'tablet', "10's", 35, 'Analgesic/Antipyretic/Anti-Inflammatory');
add('Chlorpheniramine 2mg and Dextromethorphan 10mg Syrup', ['chlorpheniramine', 'dextromethorphan'], '2mg+10mg', 'syrup', '100ml', 26, 'Cold/Cough');
add('Paracetamol 250mg and Phenylephrine 5mg and Cetirizine 2mg Suspension', ['paracetamol', 'phenylephrine', 'cetirizine'], '250mg+5mg+2mg', 'syrup', '60ml', 28, 'Cold/Cough');
add('Multivitamin and Mineral Syrup', ['multivitamin'], '5ml', 'syrup', '200ml', 45, 'Vitamin');
add('Iron Syrup 50mg/5ml', ['ferrous sulphate'], '50mg/5ml', 'syrup', '200ml', 32, 'Haematinic');
add('Oral Rehydration Salts Apple Flavour', ['ors'], '21g', 'powder', '1 sachet', 3, 'Electrolyte');
add('Povidone Iodine 10% Ointment', ['povidone iodine'], '10%', 'ointment', '15g', 22, 'Antiseptic');
add('Silver Sulfadiazine 1% Cream', ['silver sulfadiazine'], '1%', 'cream', '20g', 28, 'Dermatology');
add('Benzoyl Peroxide 2.5% Gel', ['benzoyl peroxide'], '2.5%', 'gel', '20g', 30, 'Dermatology');
add('Salicylic Acid 6% Ointment', ['salicylic acid'], '6%', 'ointment', '15g', 16, 'Dermatology');
add('Lignocaine 2% Jelly', ['lignocaine'], '2%', 'gel', '20g', 18, 'Local anaesthetic');
add('Lignocaine 2% Injection', ['lignocaine'], '2%', 'injection', '30ml', 14, 'Local anaesthetic');

const newBrands = [
  ['Meftal 500', ['meftal'], ['mefenamic acid'], '500mg', 'tablet', 55],
  ['Meftal Spas', ['meftal spas'], ['mefenamic acid'], '250mg', 'tablet', 48],
  ['Cyclopam', ['cyclopam'], ['dicyclomine'], '10mg', 'tablet', 32],
  ['Taxim O 100', ['taxim o 100'], ['cefixime'], '100mg', 'tablet', 120],
  ['Zifi 200', ['zifi', 'zifi200'], ['cefixime'], '200mg', 'tablet', 150],
  ['Monocef 1g', ['monocef'], ['ceftriaxone'], '1g', 'injection', 65],
  ['Candid Cream', ['candid'], ['clotrimazole'], '1%', 'cream', 110],
  ['Betadine', ['betadine'], ['povidone iodine'], '5%', 'solution', 95],
  ['Volini Gel', ['volini'], ['diclofenac'], '1%', 'gel', 180],
  ['Asthalin 2', ['asthalin 2'], ['salbutamol'], '2mg', 'tablet', 18],
  ['Foracort', ['foracort'], ['budesonide', 'formoterol'], '200mcg+6mcg', 'inhaler', 320],
  ['Duolin', ['duolin'], ['salbutamol', 'ipratropium'], '100mcg+20mcg', 'inhaler', 280],
  ['Glycomet GP 1', ['glycomet gp'], ['glimepiride', 'metformin'], '1mg+500mg', 'tablet', 95],
  ['Glycomet GP2', ['glycomet gp2'], ['glimepiride', 'metformin'], '2mg+500mg', 'tablet', 110],
  ['Telma 80', ['telma80'], ['telmisartan'], '80mg', 'tablet', 180],
  ['Telma CT', ['telma ct'], ['telmisartan', 'chlorthalidone'], '40mg+12.5mg', 'tablet', 190],
  ['Amlopres AT', ['amlopres at'], ['amlodipine', 'atenolol'], '5mg+50mg', 'tablet', 85],
  ['Losar A', ['losar a'], ['losartan', 'amlodipine'], '50mg+5mg', 'tablet', 140],
  ['Ecosprin AV 75', ['ecosprin av'], ['atorvastatin', 'aspirin'], '10mg+75mg', 'capsule', 55],
  ['Montair FX', ['montair fx'], ['montelukast', 'fexofenadine'], '10mg+120mg', 'tablet', 220],
  ['Zerodol SP', ['zerodol sp'], ['aceclofenac', 'serratiopeptidase'], '100mg+15mg', 'tablet', 130],
  ['Ultracet', ['ultracet'], ['tramadol', 'paracetamol'], '37.5mg+325mg', 'tablet', 95],
  ['Oflox OZ', ['oflox oz'], ['ofloxacin', 'ornidazole'], '200mg+500mg', 'tablet', 120],
  ['Lumerax', ['lumerax'], ['artemether', 'lumefantrine'], '80mg+480mg', 'tablet', 180],
  ['HCQS 200', ['hcqs'], ['hydroxychloroquine'], '200mg', 'tablet', 140],
  ['Folvite', ['folvite'], ['folic acid'], '5mg', 'tablet', 22],
  ['Shelcal XT', ['shelcal xt'], ['calcium carbonate', 'cholecalciferol'], '500mg+500iu', 'tablet', 180],
  ['Thyronorm 25', ['thyronorm25'], ['thyroxine'], '25mcg', 'tablet', 130],
  ['Thyronorm 75', ['thyronorm75'], ['thyroxine'], '75mcg', 'tablet', 155],
  ['Eltroxin 100', ['eltroxin100'], ['thyroxine'], '100mcg', 'tablet', 150],
  ['Janumet', ['janumet'], ['sitagliptin', 'metformin'], '50mg+500mg', 'tablet', 420],
  ['Galvus Met', ['galvus met'], ['vildagliptin', 'metformin'], '50mg+500mg', 'tablet', 390],
  ['Jardiance 10', ['jardiance'], ['empagliflozin'], '10mg', 'tablet', 480],
  ['Cilacar 10', ['cilacar'], ['cilnidipine'], '10mg', 'tablet', 95],
  ['Cilacar T', ['cilacar t'], ['cilnidipine', 'telmisartan'], '10mg+40mg', 'tablet', 160],
  ['Concor 5', ['concor'], ['bisoprolol'], '5mg', 'tablet', 120],
  ['Nebicard 5', ['nebicard'], ['nebivolol'], '5mg', 'tablet', 140],
  ['Dytor 10', ['dytor'], ['torsemide'], '10mg', 'tablet', 70],
  ['Aldactone 25', ['aldactone'], ['spironolactone'], '25mg', 'tablet', 55],
  ['Lasix 40', ['lasix'], ['furosemide'], '40mg', 'tablet', 12],
  ['Lonazep 0.5', ['lonazep'], ['clonazepam'], '0.5mg', 'tablet', 35],
  ['Petril 0.5', ['petril'], ['clonazepam'], '0.5mg', 'tablet', 32],
  ['Oleanz 5', ['oleanz'], ['olanzapine'], '5mg', 'tablet', 45],
  ['Nexito 10', ['nexito'], ['escitalopram'], '10mg', 'tablet', 95],
  ['Duzela 30', ['duzela'], ['duloxetine'], '30mg', 'capsule', 110],
  ['Pregaba 75', ['pregaba'], ['pregabalin'], '75mg', 'capsule', 160],
  ['Gabapin 300', ['gabapin'], ['gabapentin'], '300mg', 'capsule', 140],
  ['Levera 500', ['levera'], ['levetiracetam'], '500mg', 'tablet', 180],
  ['Valparin 200', ['valparin'], ['sodium valproate'], '200mg', 'tablet', 55],
  ['Eptoin 100', ['eptoin'], ['phenytoin'], '100mg', 'tablet', 25],
  ['Rantac 150', ['rantac'], ['ranitidine'], '150mg', 'tablet', 18],
  ['Rablet 20', ['rablet'], ['rabeprazole'], '20mg', 'tablet', 130],
  ['Somazec 40', ['sompraz', 'somazec'], ['esomeprazole'], '40mg', 'tablet', 150],
  ['Emeset 8', ['emeset 8'], ['ondansetron'], '8mg', 'tablet', 70],
  ['Domstal DT', ['domstal dt'], ['domperidone'], '10mg', 'tablet', 30],
  ['Ibugesic', ['ibugesic'], ['ibuprofen'], '400mg', 'tablet', 18],
  ['Flexon', ['flexon'], ['ibuprofen', 'paracetamol'], '400mg+325mg', 'tablet', 28],
  ['Sumo', ['sumo'], ['nimesulide'], '100mg', 'tablet', 35],
  ['Nise', ['nise'], ['nimesulide'], '100mg', 'tablet', 32],
  ['Disprin', ['disprin'], ['aspirin'], '325mg', 'tablet', 12],
  ['Clopilet A', ['clopilet a'], ['aspirin', 'clopidogrel'], '75mg+75mg', 'capsule', 85],
  ['Atorva 20', ['atorva20'], ['atorvastatin'], '20mg', 'tablet', 140],
  ['Rosuvas 20', ['rosuvas20'], ['rosuvastatin'], '20mg', 'tablet', 210],
  ['Tonact 10', ['tonact'], ['atorvastatin'], '10mg', 'tablet', 80],
  ['Amaryl M 1', ['amaryl m'], ['glimepiride', 'metformin'], '1mg+500mg', 'tablet', 120],
  ['Amaryl 1', ['amaryl1'], ['glimepiride'], '1mg', 'tablet', 70],
  ['Istamet', ['istamet'], ['sitagliptin', 'metformin'], '50mg+500mg', 'tablet', 280],
  ['Tendia 20', ['tendia'], ['teneligliptin'], '20mg', 'tablet', 90],
  ['Oxra 10', ['oxra'], ['dapagliflozin'], '10mg', 'tablet', 450],
  ['Glimisave M2', ['glimisave'], ['glimepiride', 'metformin'], '2mg+500mg', 'tablet', 70],
  ['Cetgel', ['cetgel'], ['cetirizine'], '10mg', 'tablet', 15],
  ['Allegra 180', ['allegra180'], ['fexofenadine'], '180mg', 'tablet', 210],
  ['Monticope', ['monticope'], ['montelukast', 'levocetirizine'], '10mg+5mg', 'tablet', 140],
  ['Telekast L', ['telekast l'], ['montelukast', 'levocetirizine'], '10mg+5mg', 'tablet', 130],
  ['Deriphyllin', ['deriphyllin'], ['theophylline'], '200mg', 'tablet', 18],
  ['Grilinctus', ['grilinctus'], ['dextromethorphan'], '10mg/5ml', 'syrup', 95],
  ['Benadryl', ['benadryl'], ['dextromethorphan'], '10mg/5ml', 'syrup', 110],
  ['Calpol Syrup', ['calpol syrup'], ['paracetamol'], '125mg/5ml', 'syrup', 40],
  ['Crocin Syrup', ['crocin syrup'], ['paracetamol'], '125mg/5ml', 'syrup', 42],
  ['Augmentin DDS', ['augmentin dds'], ['amoxicillin'], '250mg/5ml', 'syrup', 160],
  ['Azee Syrup', ['azee syrup'], ['azithromycin'], '200mg/5ml', 'syrup', 85],
  ['Oflomac 200', ['oflomac'], ['ofloxacin'], '200mg', 'tablet', 55],
  ['Levoflox 500', ['levoflox'], ['levofloxacin'], '500mg', 'tablet', 90],
  ['Cifran 500', ['cifran'], ['ciprofloxacin'], '500mg', 'tablet', 48],
  ['Metrogyl 400', ['metrogyl'], ['metronidazole'], '400mg', 'tablet', 14],
  ['Flagyl 400', ['flagyl'], ['metronidazole'], '400mg', 'tablet', 16],
  ['Zocon 150', ['zocon'], ['fluconazole'], '150mg', 'capsule', 25],
  ['Forcan 150', ['forcan'], ['fluconazole'], '150mg', 'capsule', 22],
  ['Zovirax 400', ['zovirax'], ['acyclovir'], '400mg', 'tablet', 180],
  ['Tamiflu', ['tamiflu'], ['oseltamivir'], '75mg', 'capsule', 450],
  ['Noworm', ['noworm'], ['albendazole'], '400mg', 'tablet', 12],
  ['Zentel', ['zentel'], ['albendazole'], '400mg', 'tablet', 15],
  ['Ivermectol', ['ivermectol'], ['ivermectin'], '12mg', 'tablet', 25],
  ['Zyloric 100', ['zyloric'], ['allopurinol'], '100mg', 'tablet', 22],
  ['Febutaz 40', ['febutaz'], ['febuxostat'], '40mg', 'tablet', 95],
  ['Urimax 0.4', ['urimax'], ['tamsulosin'], '0.4mg', 'capsule', 180],
  ['Finast 5', ['finast'], ['finasteride'], '5mg', 'tablet', 90],
  ['Pause 500', ['pause'], ['tranexamic acid'], '500mg', 'tablet', 55],
  ['Trapic 500', ['trapic'], ['tranexamic acid'], '500mg', 'tablet', 50],
  ['Regestrone', ['regestrone'], ['norethisterone'], '5mg', 'tablet', 40],
  ['Duphaston', ['duphaston'], ['dydrogesterone'], '10mg', 'tablet', 550],
  ['Letroz', ['letroz'], ['letrozole'], '2.5mg', 'tablet', 45],
  ['Wysolone 5', ['wysolone'], ['prednisolone'], '5mg', 'tablet', 12],
  ['Omnacortil 10', ['omnacortil'], ['prednisolone'], '10mg', 'tablet', 18],
  ['Defza 6', ['defza'], ['deflazacort'], '6mg', 'tablet', 40],
  ['Medrol 8', ['medrol'], ['methylprednisolone'], '8mg', 'tablet', 55],
  ['Folitrax 2.5', ['folitrax'], ['methotrexate'], '2.5mg', 'tablet', 35],
  ['HCQS 400', ['hcqs 400'], ['hydroxychloroquine'], '400mg', 'tablet', 190],
  ['Saaz 500', ['saaz'], ['sulfasalazine'], '500mg', 'tablet', 40],
  ['Refresh Tears', ['refresh tears'], ['carboxymethylcellulose'], '0.5%', 'solution', 180],
  ['Moxicip Eye', ['moxicip'], ['moxifloxacin'], '0.5%', 'solution', 120],
  ['Ciplox Eye', ['ciplox eye'], ['ciprofloxacin'], '0.3%', 'solution', 25],
  ['Latoprost', ['latoprost'], ['latanoprost'], '0.005%', 'solution', 220],
  ['Timolet', ['timolet'], ['timolol'], '0.5%', 'solution', 45],
  ['Keto Cream', ['keto cream'], ['ketoconazole'], '2%', 'cream', 90],
  ['Terbinaforce Cream', ['terbinaforce'], ['terbinafine'], '1%', 'cream', 85],
  ['Momate', ['momate'], ['mometasone'], '0.1%', 'cream', 140],
  ['Permite', ['permite'], ['permethrin'], '5%', 'cream', 55],
  ['Supradyn', ['supradyn'], ['multivitamin'], '1 tab', 'tablet', 45],
  ['Becosules', ['becosules'], ['vitamin b complex'], '1 tab', 'tablet', 30],
  ['Zincovit', ['zincovit'], ['multivitamin'], '1 tab', 'tablet', 95],
  ['Evion 400', ['evion'], ['omega 3'], '1000mg', 'capsule', 35],
  ['Uprise D3', ['uprise'], ['cholecalciferol'], '60000iu', 'capsule', 80],
  ['D Rise 60K', ['d rise'], ['cholecalciferol'], '60000iu', 'capsule', 70],
  ['Autrin', ['autrin'], ['ferrous sulphate', 'folic acid'], '100mg+0.5mg', 'tablet', 55],
  ['Dexorange', ['dexorange'], ['ferrous sulphate'], '50mg/5ml', 'syrup', 140],
  ['Electral', ['electral'], ['ors'], '21.8g', 'powder', 22],
  ['ORS Apple', ['ors apple'], ['ors'], '21g', 'powder', 20],
  ['Pansec 40', ['pansec'], ['pantoprazole'], '40mg', 'tablet', 90],
  ['Pantodac 40', ['pantodac'], ['pantoprazole'], '40mg', 'tablet', 100],
  ['Razo 20', ['razo-20'], ['rabeprazole'], '20mg', 'tablet', 140],
];

const addedBrands = [];
for (const [brand, aliases, salts, strength, form, approx_mrp] of newBrands) {
  if (haveBrand.has(brand.toLowerCase())) continue;
  if (!have.has(keyOf(salts, strength))) continue;
  haveBrand.add(brand.toLowerCase());
  addedBrands.push({
    brand,
    aliases,
    salts,
    strength,
    form,
    approx_mrp,
    note: 'approx MRP, verify on strip',
  });
}

fs.writeFileSync(jaPath, JSON.stringify([...ja, ...extra], null, 2) + '\n');
fs.writeFileSync(brPath, JSON.stringify([...brands, ...addedBrands], null, 2) + '\n');
console.log(`Added ${extra.length} generics, ${addedBrands.length} brands`);
console.log(`Now ${ja.length + extra.length} generics, ${brands.length + addedBrands.length} brands`);

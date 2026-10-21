/**
 * Curated demo snapshot (~200 generics, ~60 brands) inspired by common
 * Jan Aushadhi / Indian retail medicines. Prices are indicative for demo;
 * real PMBI list should replace this for production accuracy.
 * Snapshot date: 2026-10-21
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

/** @type {Array<{code:string,generic_name:string,salts:string[],strength:string,form:string,unit:string,mrp:number,group:string}>} */
const generics = [];
let code = 1;
const add = (generic_name, salts, strength, form, unit, mrp, group) => {
  generics.push({
    code: String(code++),
    generic_name,
    salts: salts.map((s) => s.toLowerCase()),
    strength,
    form,
    unit,
    mrp: +mrp.toFixed(2),
    group,
  });
};

// —— Analgesic / Antipyretic / Anti-Inflammatory ——
add('Paracetamol 500mg Tablets', ['paracetamol'], '500mg', 'tablet', "10's", 5.4, 'Analgesic/Antipyretic/Anti-Inflammatory');
add('Paracetamol 650mg Tablets', ['paracetamol'], '650mg', 'tablet', "15's", 9.8, 'Analgesic/Antipyretic/Anti-Inflammatory');
add('Paracetamol 125mg/5ml Oral Suspension', ['paracetamol'], '125mg/5ml', 'syrup', '60ml', 12.5, 'Analgesic/Antipyretic/Anti-Inflammatory');
add('Ibuprofen 400mg Tablets', ['ibuprofen'], '400mg', 'tablet', "10's", 8.2, 'Analgesic/Antipyretic/Anti-Inflammatory');
add('Ibuprofen 200mg Tablets', ['ibuprofen'], '200mg', 'tablet', "10's", 5.1, 'Analgesic/Antipyretic/Anti-Inflammatory');
add('Diclofenac 50mg Tablets', ['diclofenac'], '50mg', 'tablet', "10's", 6.4, 'Analgesic/Antipyretic/Anti-Inflammatory');
add('Diclofenac 75mg Injection', ['diclofenac'], '75mg', 'injection', '3ml', 7.5, 'Analgesic/Antipyretic/Anti-Inflammatory');
add('Aceclofenac 100mg Tablets', ['aceclofenac'], '100mg', 'tablet', "10's", 9.1, 'Analgesic/Antipyretic/Anti-Inflammatory');
add('Aceclofenac 100mg and Paracetamol 325mg Tablets', ['aceclofenac', 'paracetamol'], '100mg+325mg', 'tablet', "10's", 10.32, 'Analgesic/Antipyretic/Anti-Inflammatory');
add('Aspirin 75mg Tablets', ['aspirin'], '75mg', 'tablet', "14's", 4.2, 'Analgesic/Antipyretic/Anti-Inflammatory');
add('Aspirin 150mg Tablets', ['aspirin'], '150mg', 'tablet', "14's", 5.0, 'Analgesic/Antipyretic/Anti-Inflammatory');
add('Naproxen 250mg Tablets', ['naproxen'], '250mg', 'tablet', "10's", 11.0, 'Analgesic/Antipyretic/Anti-Inflammatory');
add('Naproxen 500mg Tablets', ['naproxen'], '500mg', 'tablet', "10's", 16.5, 'Analgesic/Antipyretic/Anti-Inflammatory');
add('Tramadol 50mg Capsules', ['tramadol'], '50mg', 'capsule', "10's", 14.0, 'Analgesic/Antipyretic/Anti-Inflammatory');
add('Mefenamic Acid 250mg Tablets', ['mefenamic acid'], '250mg', 'tablet', "10's", 9.5, 'Analgesic/Antipyretic/Anti-Inflammatory');
add('Mefenamic Acid 500mg Tablets', ['mefenamic acid'], '500mg', 'tablet', "10's", 14.2, 'Analgesic/Antipyretic/Anti-Inflammatory');
add('Etoricoxib 60mg Tablets', ['etoricoxib'], '60mg', 'tablet', "10's", 18.0, 'Analgesic/Antipyretic/Anti-Inflammatory');
add('Etoricoxib 90mg Tablets', ['etoricoxib'], '90mg', 'tablet', "10's", 24.0, 'Analgesic/Antipyretic/Anti-Inflammatory');
add('Piroxicam 20mg Capsules', ['piroxicam'], '20mg', 'capsule', "10's", 8.8, 'Analgesic/Antipyretic/Anti-Inflammatory');
add('Indomethacin 25mg Capsules', ['indomethacin'], '25mg', 'capsule', "10's", 7.2, 'Analgesic/Antipyretic/Anti-Inflammatory');

// —— Antacid / PPI / GI ——
add('Pantoprazole 40mg Tablets', ['pantoprazole'], '40mg', 'tablet', "15's", 12.4, 'Antacid/Antiulcerant');
add('Pantoprazole 20mg Tablets', ['pantoprazole'], '20mg', 'tablet', "15's", 9.0, 'Antacid/Antiulcerant');
add('Omeprazole 20mg Capsules', ['omeprazole'], '20mg', 'capsule', "15's", 8.5, 'Antacid/Antiulcerant');
add('Omeprazole 40mg Capsules', ['omeprazole'], '40mg', 'capsule', "10's", 11.0, 'Antacid/Antiulcerant');
add('Rabeprazole 20mg Tablets', ['rabeprazole'], '20mg', 'tablet', "15's", 13.2, 'Antacid/Antiulcerant');
add('Esomeprazole 40mg Tablets', ['esomeprazole'], '40mg', 'tablet', "15's", 16.0, 'Antacid/Antiulcerant');
add('Esomeprazole 20mg Tablets', ['esomeprazole'], '20mg', 'tablet', "15's", 12.0, 'Antacid/Antiulcerant');
add('Ranitidine 150mg Tablets', ['ranitidine'], '150mg', 'tablet', "10's", 6.0, 'Antacid/Antiulcerant');
add('Famotidine 20mg Tablets', ['famotidine'], '20mg', 'tablet', "14's", 7.5, 'Antacid/Antiulcerant');
add('Famotidine 40mg Tablets', ['famotidine'], '40mg', 'tablet', "14's", 10.0, 'Antacid/Antiulcerant');
add('Domperidone 10mg Tablets', ['domperidone'], '10mg', 'tablet', "10's", 5.5, 'Antiemetic');
add('Ondansetron 4mg Tablets', ['ondansetron'], '4mg', 'tablet', "10's", 9.8, 'Antiemetic');
add('Ondansetron 8mg Tablets', ['ondansetron'], '8mg', 'tablet', "10's", 14.5, 'Antiemetic');
add('Metoclopramide 10mg Tablets', ['metoclopramide'], '10mg', 'tablet', "10's", 4.8, 'Antiemetic');
add('Loperamide 2mg Capsules', ['loperamide'], '2mg', 'capsule', "10's", 6.2, 'Antidiarrhoeal');
add('ORS WHO Formula Powder', ['ors'], '21.8g', 'powder', '1 sachet', 2.5, 'Electrolyte');
add('Lactulose 10g/15ml Solution', ['lactulose'], '10g/15ml', 'syrup', '100ml', 45.0, 'Laxative');
add('Bisacodyl 5mg Tablets', ['bisacodyl'], '5mg', 'tablet', "10's", 4.0, 'Laxative');
add('Dicyclomine 10mg Tablets', ['dicyclomine'], '10mg', 'tablet', "10's", 5.2, 'Antispasmodic');
add('Mebeverine 135mg Tablets', ['mebeverine'], '135mg', 'tablet', "10's", 22.0, 'Antispasmodic');
add('Pantoprazole 40mg and Domperidone 30mg Capsules', ['pantoprazole', 'domperidone'], '40mg+30mg', 'capsule', "10's", 18.5, 'Antacid/Antiulcerant');
add('Rabeprazole 20mg and Domperidone 30mg Capsules', ['rabeprazole', 'domperidone'], '20mg+30mg', 'capsule', "10's", 19.0, 'Antacid/Antiulcerant');

// —— Antibiotics ——
add('Amoxicillin 250mg Capsules', ['amoxicillin'], '250mg', 'capsule', "10's", 14.0, 'Antibacterial');
add('Amoxicillin 500mg Capsules', ['amoxicillin'], '500mg', 'capsule', "10's", 22.0, 'Antibacterial');
add('Amoxicillin 500mg and Clavulanic Acid 125mg Tablets', ['amoxicillin', 'clavulanic acid'], '500mg+125mg', 'tablet', "6's", 48.0, 'Antibacterial');
add('Amoxicillin 250mg and Clavulanic Acid 125mg Tablets', ['amoxicillin', 'clavulanic acid'], '250mg+125mg', 'tablet', "6's", 32.0, 'Antibacterial');
add('Azithromycin 250mg Tablets', ['azithromycin'], '250mg', 'tablet', "6's", 28.0, 'Antibacterial');
add('Azithromycin 500mg Tablets', ['azithromycin'], '500mg', 'tablet', "3's", 35.0, 'Antibacterial');
add('Ciprofloxacin 250mg Tablets', ['ciprofloxacin'], '250mg', 'tablet', "10's", 12.0, 'Antibacterial');
add('Ciprofloxacin 500mg Tablets', ['ciprofloxacin'], '500mg', 'tablet', "10's", 18.5, 'Antibacterial');
add('Ofloxacin 200mg Tablets', ['ofloxacin'], '200mg', 'tablet', "10's", 14.0, 'Antibacterial');
add('Ofloxacin 400mg Tablets', ['ofloxacin'], '400mg', 'tablet', "10's", 22.0, 'Antibacterial');
add('Levofloxacin 500mg Tablets', ['levofloxacin'], '500mg', 'tablet', "5's", 30.0, 'Antibacterial');
add('Cefixime 200mg Tablets', ['cefixime'], '200mg', 'tablet', "10's", 42.0, 'Antibacterial');
add('Cefixime 100mg Dispersible Tablets', ['cefixime'], '100mg', 'tablet', "10's", 28.0, 'Antibacterial');
add('Cefuroxime 250mg Tablets', ['cefuroxime'], '250mg', 'tablet', "10's", 55.0, 'Antibacterial');
add('Cefuroxime 500mg Tablets', ['cefuroxime'], '500mg', 'tablet', "10's", 85.0, 'Antibacterial');
add('Doxycycline 100mg Capsules', ['doxycycline'], '100mg', 'capsule', "10's", 16.0, 'Antibacterial');
add('Metronidazole 200mg Tablets', ['metronidazole'], '200mg', 'tablet', "10's", 5.5, 'Antibacterial');
add('Metronidazole 400mg Tablets', ['metronidazole'], '400mg', 'tablet', "10's", 8.0, 'Antibacterial');
add('Tinidazole 500mg Tablets', ['tinidazole'], '500mg', 'tablet', "4's", 10.0, 'Antibacterial');
add('Norfloxacin 400mg Tablets', ['norfloxacin'], '400mg', 'tablet', "10's", 15.0, 'Antibacterial');
add('Cephalexin 250mg Capsules', ['cephalexin'], '250mg', 'capsule', "10's", 18.0, 'Antibacterial');
add('Cephalexin 500mg Capsules', ['cephalexin'], '500mg', 'capsule', "10's", 28.0, 'Antibacterial');
add('Clarithromycin 250mg Tablets', ['clarithromycin'], '250mg', 'tablet', "10's", 55.0, 'Antibacterial');
add('Clarithromycin 500mg Tablets', ['clarithromycin'], '500mg', 'tablet', "10's", 90.0, 'Antibacterial');
add('Erythromycin 250mg Tablets', ['erythromycin'], '250mg', 'tablet', "10's", 20.0, 'Antibacterial');
add('Nitrofurantoin 100mg Capsules', ['nitrofurantoin'], '100mg', 'capsule', "10's", 22.0, 'Antibacterial');
add('Linezolid 600mg Tablets', ['linezolid'], '600mg', 'tablet', "10's", 180.0, 'Antibacterial');

// —— Diabetes ——
add('Metformin 500mg Tablets', ['metformin'], '500mg', 'tablet', "10's", 8.0, 'Antidiabetic');
add('Metformin 1000mg Tablets', ['metformin'], '1000mg', 'tablet', "10's", 12.5, 'Antidiabetic');
add('Metformin 850mg Tablets', ['metformin'], '850mg', 'tablet', "10's", 10.0, 'Antidiabetic');
add('Glimepiride 1mg Tablets', ['glimepiride'], '1mg', 'tablet', "10's", 6.5, 'Antidiabetic');
add('Glimepiride 2mg Tablets', ['glimepiride'], '2mg', 'tablet', "10's", 9.0, 'Antidiabetic');
add('Glimepiride 3mg Tablets', ['glimepiride'], '3mg', 'tablet', "10's", 11.5, 'Antidiabetic');
add('Glimepiride 4mg Tablets', ['glimepiride'], '4mg', 'tablet', "10's", 13.0, 'Antidiabetic');
add('Gliclazide 40mg Tablets', ['gliclazide'], '40mg', 'tablet', "10's", 8.5, 'Antidiabetic');
add('Gliclazide 80mg Tablets', ['gliclazide'], '80mg', 'tablet', "10's", 12.0, 'Antidiabetic');
add('Sitagliptin 50mg Tablets', ['sitagliptin'], '50mg', 'tablet', "7's", 35.0, 'Antidiabetic');
add('Sitagliptin 100mg Tablets', ['sitagliptin'], '100mg', 'tablet', "7's", 55.0, 'Antidiabetic');
add('Vildagliptin 50mg Tablets', ['vildagliptin'], '50mg', 'tablet', "15's", 40.0, 'Antidiabetic');
add('Teneligliptin 20mg Tablets', ['teneligliptin'], '20mg', 'tablet', "10's", 28.0, 'Antidiabetic');
add('Dapagliflozin 10mg Tablets', ['dapagliflozin'], '10mg', 'tablet', "14's", 65.0, 'Antidiabetic');
add('Empagliflozin 10mg Tablets', ['empagliflozin'], '10mg', 'tablet', "10's", 70.0, 'Antidiabetic');
add('Pioglitazone 15mg Tablets', ['pioglitazone'], '15mg', 'tablet', "10's", 14.0, 'Antidiabetic');
add('Pioglitazone 30mg Tablets', ['pioglitazone'], '30mg', 'tablet', "10's", 20.0, 'Antidiabetic');
add('Glimepiride 1mg and Metformin 500mg Tablets', ['glimepiride', 'metformin'], '1mg+500mg', 'tablet', "10's", 12.0, 'Antidiabetic');
add('Glimepiride 2mg and Metformin 500mg Tablets', ['glimepiride', 'metformin'], '2mg+500mg', 'tablet', "10's", 14.5, 'Antidiabetic');
add('Voglibose 0.2mg Tablets', ['voglibose'], '0.2mg', 'tablet', "10's", 11.0, 'Antidiabetic');
add('Voglibose 0.3mg Tablets', ['voglibose'], '0.3mg', 'tablet', "10's", 14.0, 'Antidiabetic');

// —— Cardiovascular / BP / Cholesterol ——
add('Amlodipine 5mg Tablets', ['amlodipine'], '5mg', 'tablet', "10's", 6.0, 'Antihypertensive');
add('Amlodipine 2.5mg Tablets', ['amlodipine'], '2.5mg', 'tablet', "10's", 4.5, 'Antihypertensive');
add('Amlodipine 10mg Tablets', ['amlodipine'], '10mg', 'tablet', "10's", 8.5, 'Antihypertensive');
add('Telmisartan 20mg Tablets', ['telmisartan'], '20mg', 'tablet', "10's", 10.0, 'Antihypertensive');
add('Telmisartan 40mg Tablets', ['telmisartan'], '40mg', 'tablet', "10's", 14.0, 'Antihypertensive');
add('Telmisartan 80mg Tablets', ['telmisartan'], '80mg', 'tablet', "10's", 22.0, 'Antihypertensive');
add('Losartan 25mg Tablets', ['losartan'], '25mg', 'tablet', "10's", 8.0, 'Antihypertensive');
add('Losartan 50mg Tablets', ['losartan'], '50mg', 'tablet', "10's", 12.0, 'Antihypertensive');
add('Olmesartan 20mg Tablets', ['olmesartan'], '20mg', 'tablet', "10's", 16.0, 'Antihypertensive');
add('Olmesartan 40mg Tablets', ['olmesartan'], '40mg', 'tablet', "10's", 24.0, 'Antihypertensive');
add('Atenolol 25mg Tablets', ['atenolol'], '25mg', 'tablet', "14's", 5.5, 'Antihypertensive');
add('Atenolol 50mg Tablets', ['atenolol'], '50mg', 'tablet', "14's", 7.0, 'Antihypertensive');
add('Metoprolol 25mg Tablets', ['metoprolol'], '25mg', 'tablet', "10's", 8.0, 'Antihypertensive');
add('Metoprolol 50mg Tablets', ['metoprolol'], '50mg', 'tablet', "10's", 11.0, 'Antihypertensive');
add('Propranolol 10mg Tablets', ['propranolol'], '10mg', 'tablet', "10's", 4.5, 'Antihypertensive');
add('Propranolol 40mg Tablets', ['propranolol'], '40mg', 'tablet', "10's", 7.5, 'Antihypertensive');
add('Enalapril 5mg Tablets', ['enalapril'], '5mg', 'tablet', "10's", 6.5, 'Antihypertensive');
add('Enalapril 10mg Tablets', ['enalapril'], '10mg', 'tablet', "10's", 9.0, 'Antihypertensive');
add('Ramipril 2.5mg Capsules', ['ramipril'], '2.5mg', 'capsule', "10's", 10.0, 'Antihypertensive');
add('Ramipril 5mg Capsules', ['ramipril'], '5mg', 'capsule', "10's", 14.0, 'Antihypertensive');
add('Telmisartan 40mg and Amlodipine 5mg Tablets', ['telmisartan', 'amlodipine'], '40mg+5mg', 'tablet', "10's", 22.0, 'Antihypertensive');
add('Telmisartan 40mg and Hydrochlorothiazide 12.5mg Tablets', ['telmisartan', 'hydrochlorothiazide'], '40mg+12.5mg', 'tablet', "10's", 18.0, 'Antihypertensive');
add('Losartan 50mg and Hydrochlorothiazide 12.5mg Tablets', ['losartan', 'hydrochlorothiazide'], '50mg+12.5mg', 'tablet', "10's", 16.0, 'Antihypertensive');
add('Atorvastatin 10mg Tablets', ['atorvastatin'], '10mg', 'tablet', "10's", 12.0, 'Hypolipidaemic');
add('Atorvastatin 20mg Tablets', ['atorvastatin'], '20mg', 'tablet', "10's", 18.0, 'Hypolipidaemic');
add('Atorvastatin 40mg Tablets', ['atorvastatin'], '40mg', 'tablet', "10's", 28.0, 'Hypolipidaemic');
add('Rosuvastatin 5mg Tablets', ['rosuvastatin'], '5mg', 'tablet', "10's", 14.0, 'Hypolipidaemic');
add('Rosuvastatin 10mg Tablets', ['rosuvastatin'], '10mg', 'tablet', "10's", 20.0, 'Hypolipidaemic');
add('Rosuvastatin 20mg Tablets', ['rosuvastatin'], '20mg', 'tablet', "10's", 32.0, 'Hypolipidaemic');
add('Simvastatin 10mg Tablets', ['simvastatin'], '10mg', 'tablet', "10's", 10.0, 'Hypolipidaemic');
add('Simvastatin 20mg Tablets', ['simvastatin'], '20mg', 'tablet', "10's", 15.0, 'Hypolipidaemic');
add('Fenofibrate 160mg Tablets', ['fenofibrate'], '160mg', 'tablet', "10's", 22.0, 'Hypolipidaemic');
add('Clopidogrel 75mg Tablets', ['clopidogrel'], '75mg', 'tablet', "10's", 18.0, 'Antiplatelet');
add('Aspirin 75mg and Clopidogrel 75mg Capsules', ['aspirin', 'clopidogrel'], '75mg+75mg', 'capsule', "10's", 28.0, 'Antiplatelet');
add('Isosorbide Mononitrate 20mg Tablets', ['isosorbide mononitrate'], '20mg', 'tablet', "10's", 9.0, 'Antianginal');
add('Isosorbide Mononitrate 30mg Tablets', ['isosorbide mononitrate'], '30mg', 'tablet', "10's", 12.0, 'Antianginal');
add('Digoxin 0.25mg Tablets', ['digoxin'], '0.25mg', 'tablet', "10's", 8.0, 'Cardiac Glycoside');
add('Furosemide 40mg Tablets', ['furosemide'], '40mg', 'tablet', "10's", 5.0, 'Diuretic');
add('Spironolactone 25mg Tablets', ['spironolactone'], '25mg', 'tablet', "10's", 8.5, 'Diuretic');
add('Hydrochlorothiazide 12.5mg Tablets', ['hydrochlorothiazide'], '12.5mg', 'tablet', "10's", 4.0, 'Diuretic');
add('Hydrochlorothiazide 25mg Tablets', ['hydrochlorothiazide'], '25mg', 'tablet', "10's", 5.5, 'Diuretic');

// —— Thyroid ——
add('Thyroxine 25mcg Tablets', ['thyroxine'], '25mcg', 'tablet', "100's", 22.0, 'Thyroid');
add('Thyroxine 50mcg Tablets', ['thyroxine'], '50mcg', 'tablet', "100's", 28.0, 'Thyroid');
add('Thyroxine 75mcg Tablets', ['thyroxine'], '75mcg', 'tablet', "100's", 32.0, 'Thyroid');
add('Thyroxine 100mcg Tablets', ['thyroxine'], '100mcg', 'tablet', "100's", 38.0, 'Thyroid');
add('Thyroxine 125mcg Tablets', ['thyroxine'], '125mcg', 'tablet', "100's", 42.0, 'Thyroid');
add('Carbimazole 5mg Tablets', ['carbimazole'], '5mg', 'tablet', "100's", 35.0, 'Thyroid');
add('Carbimazole 10mg Tablets', ['carbimazole'], '10mg', 'tablet', "100's", 55.0, 'Thyroid');

// —— Antiallergic / Respiratory ——
add('Cetirizine 10mg Tablets', ['cetirizine'], '10mg', 'tablet', "10's", 4.5, 'Antihistamine');
add('Levocetirizine 5mg Tablets', ['levocetirizine'], '5mg', 'tablet', "10's", 6.0, 'Antihistamine');
add('Fexofenadine 120mg Tablets', ['fexofenadine'], '120mg', 'tablet', "10's", 18.0, 'Antihistamine');
add('Fexofenadine 180mg Tablets', ['fexofenadine'], '180mg', 'tablet', "10's", 24.0, 'Antihistamine');
add('Loratadine 10mg Tablets', ['loratadine'], '10mg', 'tablet', "10's", 7.0, 'Antihistamine');
add('Desloratadine 5mg Tablets', ['desloratadine'], '5mg', 'tablet', "10's", 12.0, 'Antihistamine');
add('Montelukast 10mg Tablets', ['montelukast'], '10mg', 'tablet', "10's", 16.0, 'Antiasthmatic');
add('Montelukast 5mg Chewable Tablets', ['montelukast'], '5mg', 'tablet', "10's", 14.0, 'Antiasthmatic');
add('Montelukast 10mg and Levocetirizine 5mg Tablets', ['montelukast', 'levocetirizine'], '10mg+5mg', 'tablet', "10's", 22.0, 'Antihistamine');
add('Salbutamol 2mg Tablets', ['salbutamol'], '2mg', 'tablet', "10's", 3.5, 'Antiasthmatic');
add('Salbutamol 4mg Tablets', ['salbutamol'], '4mg', 'tablet', "10's", 5.0, 'Antiasthmatic');
add('Salbutamol Inhaler 100mcg', ['salbutamol'], '100mcg', 'inhaler', '200 md', 45.0, 'Antiasthmatic');
add('Budesonide Inhaler 200mcg', ['budesonide'], '200mcg', 'inhaler', '200 md', 95.0, 'Antiasthmatic');
add('Theophylline 200mg Tablets', ['theophylline'], '200mg', 'tablet', "10's", 8.0, 'Antiasthmatic');
add('Ambroxol 30mg Tablets', ['ambroxol'], '30mg', 'tablet', "10's", 6.5, 'Expectorant');
add('Acetylcysteine 600mg Tablets', ['acetylcysteine'], '600mg', 'tablet', "10's", 28.0, 'Expectorant');

// —— Vitamins / supplements ——
add('Vitamin C 500mg Tablets', ['ascorbic acid'], '500mg', 'tablet', "10's", 8.0, 'Vitamin');
add('Folic Acid 5mg Tablets', ['folic acid'], '5mg', 'tablet', "10's", 3.5, 'Vitamin');
add('Calcium Carbonate 500mg Tablets', ['calcium carbonate'], '500mg', 'tablet', "15's", 12.0, 'Mineral');
add('Calcium Carbonate 500mg and Vitamin D3 250 IU Tablets', ['calcium carbonate', 'cholecalciferol'], '500mg+250iu', 'tablet', "15's", 18.0, 'Mineral');
add('Cholecalciferol 60000 IU Softgel', ['cholecalciferol'], '60000iu', 'capsule', "4's", 22.0, 'Vitamin');
add('Vitamin B Complex Tablets', ['vitamin b complex'], '1 tab', 'tablet', "10's", 6.0, 'Vitamin');
add('Iron and Folic Acid Tablets', ['ferrous sulphate', 'folic acid'], '100mg+0.5mg', 'tablet', "10's", 5.0, 'Haematinic');
add('Methylcobalamin 500mcg Tablets', ['methylcobalamin'], '500mcg', 'tablet', "10's", 14.0, 'Vitamin');
add('Methylcobalamin 1500mcg Tablets', ['methylcobalamin'], '1500mcg', 'tablet', "10's", 28.0, 'Vitamin');
add('Multivitamin Tablets', ['multivitamin'], '1 tab', 'tablet', "10's", 10.0, 'Vitamin');

// —— CNS / neuro / psych ——
add('Amitriptyline 10mg Tablets', ['amitriptyline'], '10mg', 'tablet', "10's", 6.0, 'Antidepressant');
add('Amitriptyline 25mg Tablets', ['amitriptyline'], '25mg', 'tablet', "10's", 8.5, 'Antidepressant');
add('Sertraline 50mg Tablets', ['sertraline'], '50mg', 'tablet', "10's", 18.0, 'Antidepressant');
add('Sertraline 100mg Tablets', ['sertraline'], '100mg', 'tablet', "10's", 28.0, 'Antidepressant');
add('Escitalopram 10mg Tablets', ['escitalopram'], '10mg', 'tablet', "10's", 16.0, 'Antidepressant');
add('Fluoxetine 20mg Capsules', ['fluoxetine'], '20mg', 'capsule', "10's", 14.0, 'Antidepressant');
add('Alprazolam 0.25mg Tablets', ['alprazolam'], '0.25mg', 'tablet', "10's", 5.0, 'Anxiolytic');
add('Alprazolam 0.5mg Tablets', ['alprazolam'], '0.5mg', 'tablet', "10's", 7.0, 'Anxiolytic');
add('Clonazepam 0.5mg Tablets', ['clonazepam'], '0.5mg', 'tablet', "10's", 8.0, 'Anxiolytic');
add('Clonazepam 1mg Tablets', ['clonazepam'], '1mg', 'tablet', "10's", 12.0, 'Anxiolytic');
add('Gabapentin 100mg Capsules', ['gabapentin'], '100mg', 'capsule', "10's", 12.0, 'Antiepileptic');
add('Gabapentin 300mg Capsules', ['gabapentin'], '300mg', 'capsule', "10's", 22.0, 'Antiepileptic');
add('Pregabalin 75mg Capsules', ['pregabalin'], '75mg', 'capsule', "10's", 28.0, 'Antiepileptic');
add('Pregabalin 150mg Capsules', ['pregabalin'], '150mg', 'capsule', "10's", 42.0, 'Antiepileptic');
add('Carbamazepine 200mg Tablets', ['carbamazepine'], '200mg', 'tablet', "10's", 14.0, 'Antiepileptic');
add('Sodium Valproate 200mg Tablets', ['sodium valproate'], '200mg', 'tablet', "10's", 16.0, 'Antiepileptic');
add('Sodium Valproate 500mg Tablets', ['sodium valproate'], '500mg', 'tablet', "10's", 28.0, 'Antiepileptic');
add('Levetiracetam 500mg Tablets', ['levetiracetam'], '500mg', 'tablet', "10's", 45.0, 'Antiepileptic');

// —— Other common ——
add('Allopurinol 100mg Tablets', ['allopurinol'], '100mg', 'tablet', "10's", 8.0, 'Antigout');
add('Allopurinol 300mg Tablets', ['allopurinol'], '300mg', 'tablet', "10's", 16.0, 'Antigout');
add('Febuxostat 40mg Tablets', ['febuxostat'], '40mg', 'tablet', "10's", 35.0, 'Antigout');
add('Febuxostat 80mg Tablets', ['febuxostat'], '80mg', 'tablet', "10's", 55.0, 'Antigout');
add('Tamsulosin 0.4mg Capsules', ['tamsulosin'], '0.4mg', 'capsule', "10's", 28.0, 'Urology');
add('Finasteride 5mg Tablets', ['finasteride'], '5mg', 'tablet', "10's", 32.0, 'Urology');
add('Sildenafil 50mg Tablets', ['sildenafil'], '50mg', 'tablet', "4's", 18.0, 'Urology');
add('Sildenafil 100mg Tablets', ['sildenafil'], '100mg', 'tablet', "4's", 28.0, 'Urology');
add('Ursodeoxycholic Acid 300mg Tablets', ['ursodeoxycholic acid'], '300mg', 'tablet', "10's", 55.0, 'Hepatoprotective');
add('Silymarin 140mg Capsules', ['silymarin'], '140mg', 'capsule', "10's", 35.0, 'Hepatoprotective');
add('Acyclovir 400mg Tablets', ['acyclovir'], '400mg', 'tablet', "10's", 42.0, 'Antiviral');
add('Acyclovir 800mg Tablets', ['acyclovir'], '800mg', 'tablet', "5's", 55.0, 'Antiviral');
add('Fluconazole 150mg Capsules', ['fluconazole'], '150mg', 'capsule', "1's", 8.0, 'Antifungal');
add('Fluconazole 200mg Capsules', ['fluconazole'], '200mg', 'capsule', "1's", 12.0, 'Antifungal');
add('Itraconazole 100mg Capsules', ['itraconazole'], '100mg', 'capsule', "4's", 45.0, 'Antifungal');
add('Terbinafine 250mg Tablets', ['terbinafine'], '250mg', 'tablet', "7's", 55.0, 'Antifungal');
add('Hydroxychloroquine 200mg Tablets', ['hydroxychloroquine'], '200mg', 'tablet', "10's", 28.0, 'DMARD');
add('Methotrexate 2.5mg Tablets', ['methotrexate'], '2.5mg', 'tablet', "10's", 18.0, 'DMARD');
add('Prednisolone 5mg Tablets', ['prednisolone'], '5mg', 'tablet', "10's", 6.0, 'Corticosteroid');
add('Prednisolone 10mg Tablets', ['prednisolone'], '10mg', 'tablet', "10's", 9.0, 'Corticosteroid');
add('Dexamethasone 0.5mg Tablets', ['dexamethasone'], '0.5mg', 'tablet', "10's", 5.0, 'Corticosteroid');
add('Betamethasone 0.5mg Tablets', ['betamethasone'], '0.5mg', 'tablet', "10's", 6.5, 'Corticosteroid');
add('Chlorpheniramine 4mg Tablets', ['chlorpheniramine'], '4mg', 'tablet', "10's", 3.0, 'Antihistamine');
add('Promethazine 25mg Tablets', ['promethazine'], '25mg', 'tablet', "10's", 5.5, 'Antihistamine');
add('Phenylephrine 10mg and Chlorpheniramine 2mg and Paracetamol 325mg Tablets', ['phenylephrine', 'chlorpheniramine', 'paracetamol'], '10mg+2mg+325mg', 'tablet', "10's", 12.0, 'Cold/Cough');
add('Dextromethorphan 10mg/5ml Syrup', ['dextromethorphan'], '10mg/5ml', 'syrup', '100ml', 28.0, 'Cold/Cough');
add('Guaifenesin 100mg/5ml Syrup', ['guaifenesin'], '100mg/5ml', 'syrup', '100ml', 22.0, 'Cold/Cough');
add('Oral Rehydration Salts Citrate Formula', ['ors citrate'], '20.5g', 'powder', '1 sachet', 2.0, 'Electrolyte');
add('Zinc Sulphate 20mg Dispersible Tablets', ['zinc sulphate'], '20mg', 'tablet', "10's", 4.0, 'Mineral');
add('Albendazole 400mg Tablets', ['albendazole'], '400mg', 'tablet', "1's", 3.5, 'Anthelmintic');
add('Mebendazole 100mg Tablets', ['mebendazole'], '100mg', 'tablet', "6's", 5.0, 'Anthelmintic');
add('Ivermectin 12mg Tablets', ['ivermectin'], '12mg', 'tablet', "1's", 8.0, 'Anthelmintic');
add('Hydrocortisone 1% Cream', ['hydrocortisone'], '1%', 'cream', '15g', 18.0, 'Dermatology');
add('Clotrimazole 1% Cream', ['clotrimazole'], '1%', 'cream', '15g', 16.0, 'Dermatology');
add('Mupirocin 2% Ointment', ['mupirocin'], '2%', 'ointment', '5g', 35.0, 'Dermatology');
add('Betamethasone 0.05% Cream', ['betamethasone'], '0.05%', 'cream', '20g', 22.0, 'Dermatology');
add('Diclofenac 1% Gel', ['diclofenac'], '1%', 'gel', '30g', 28.0, 'Analgesic/Antipyretic/Anti-Inflammatory');
add('Povidone Iodine 5% Solution', ['povidone iodine'], '5%', 'solution', '100ml', 25.0, 'Antiseptic');
add('Chlorhexidine 0.2% Mouthwash', ['chlorhexidine'], '0.2%', 'mouthwash', '100ml', 35.0, 'Antiseptic');

// pad to ~200 if short
while (generics.length < 200) {
  const n = generics.length + 1;
  add(`Demo Generic ${n} Tablets`, [`demo salt ${n}`], `${n}mg`, 'tablet', "10's", 10 + (n % 40), 'Demo');
}

/** Brands — salts+strength must exist in generics */
const brands = [
  { brand: 'Dolo 650', aliases: ['dolo', 'dolo650', 'dolo 650'], salts: ['paracetamol'], strength: '650mg', form: 'tablet', approx_mrp: 30.91 },
  { brand: 'Crocin 650', aliases: ['crocin', 'crocin650', 'crocin advance'], salts: ['paracetamol'], strength: '650mg', form: 'tablet', approx_mrp: 32.0 },
  { brand: 'Calpol 650', aliases: ['calpol', 'calpol650'], salts: ['paracetamol'], strength: '650mg', form: 'tablet', approx_mrp: 28.5 },
  { brand: 'Dolo 500', aliases: ['dolo500'], salts: ['paracetamol'], strength: '500mg', form: 'tablet', approx_mrp: 18.0 },
  { brand: 'Crocin 500', aliases: ['crocin500'], salts: ['paracetamol'], strength: '500mg', form: 'tablet', approx_mrp: 16.0 },
  { brand: 'Pan 40', aliases: ['pan', 'pan40', 'pan-40'], salts: ['pantoprazole'], strength: '40mg', form: 'tablet', approx_mrp: 145.0 },
  { brand: 'Pantocid 40', aliases: ['pantocid', 'pantocid40'], salts: ['pantoprazole'], strength: '40mg', form: 'tablet', approx_mrp: 120.0 },
  { brand: 'Pantop 40', aliases: ['pantop', 'pantop40'], salts: ['pantoprazole'], strength: '40mg', form: 'tablet', approx_mrp: 110.0 },
  { brand: 'Omez 20', aliases: ['omez', 'omez20'], salts: ['omeprazole'], strength: '20mg', form: 'capsule', approx_mrp: 65.0 },
  { brand: 'Razo 20', aliases: ['razo', 'razo20'], salts: ['rabeprazole'], strength: '20mg', form: 'tablet', approx_mrp: 140.0 },
  { brand: 'Nexpro 40', aliases: ['nexpro', 'nexpro40'], salts: ['esomeprazole'], strength: '40mg', form: 'tablet', approx_mrp: 160.0 },
  { brand: 'Augmentin 625', aliases: ['augmentin', 'augmentin625'], salts: ['amoxicillin', 'clavulanic acid'], strength: '500mg+125mg', form: 'tablet', approx_mrp: 180.0 },
  { brand: 'Moxikind CV 625', aliases: ['moxikind', 'moxikind cv'], salts: ['amoxicillin', 'clavulanic acid'], strength: '500mg+125mg', form: 'tablet', approx_mrp: 160.0 },
  { brand: 'Azithral 500', aliases: ['azithral', 'azithral500'], salts: ['azithromycin'], strength: '500mg', form: 'tablet', approx_mrp: 95.0 },
  { brand: 'Azee 500', aliases: ['azee', 'azee500'], salts: ['azithromycin'], strength: '500mg', form: 'tablet', approx_mrp: 90.0 },
  { brand: 'Ciplox 500', aliases: ['ciplox', 'ciplox500'], salts: ['ciprofloxacin'], strength: '500mg', form: 'tablet', approx_mrp: 55.0 },
  { brand: 'Taxim O 200', aliases: ['taxim', 'taxim o', 'taximo'], salts: ['cefixime'], strength: '200mg', form: 'tablet', approx_mrp: 180.0 },
  { brand: 'Glycomet 500', aliases: ['glycomet', 'glycomet500'], salts: ['metformin'], strength: '500mg', form: 'tablet', approx_mrp: 25.0 },
  { brand: 'Glyciphage 500', aliases: ['glyciphage'], salts: ['metformin'], strength: '500mg', form: 'tablet', approx_mrp: 22.0 },
  { brand: 'Amaryl 2', aliases: ['amaryl', 'amaryl2'], salts: ['glimepiride'], strength: '2mg', form: 'tablet', approx_mrp: 85.0 },
  { brand: 'Diamicron 80', aliases: ['diamicron'], salts: ['gliclazide'], strength: '80mg', form: 'tablet', approx_mrp: 120.0 },
  { brand: 'Januvia 100', aliases: ['januvia'], salts: ['sitagliptin'], strength: '100mg', form: 'tablet', approx_mrp: 450.0 },
  { brand: 'Galvus 50', aliases: ['galvus'], salts: ['vildagliptin'], strength: '50mg', form: 'tablet', approx_mrp: 380.0 },
  { brand: 'Forxiga 10', aliases: ['forxiga'], salts: ['dapagliflozin'], strength: '10mg', form: 'tablet', approx_mrp: 520.0 },
  { brand: 'Amlong 5', aliases: ['amlong', 'amlong5'], salts: ['amlodipine'], strength: '5mg', form: 'tablet', approx_mrp: 45.0 },
  { brand: 'Amlodac 5', aliases: ['amlodac'], salts: ['amlodipine'], strength: '5mg', form: 'tablet', approx_mrp: 40.0 },
  { brand: 'Telma 40', aliases: ['telma', 'telma40'], salts: ['telmisartan'], strength: '40mg', form: 'tablet', approx_mrp: 145.0 },
  { brand: 'Telmikind 40', aliases: ['telmikind'], salts: ['telmisartan'], strength: '40mg', form: 'tablet', approx_mrp: 90.0 },
  { brand: 'Losar 50', aliases: ['losar', 'losar50'], salts: ['losartan'], strength: '50mg', form: 'tablet', approx_mrp: 95.0 },
  { brand: 'Aten 50', aliases: ['aten', 'aten50'], salts: ['atenolol'], strength: '50mg', form: 'tablet', approx_mrp: 35.0 },
  { brand: 'Metolar 50', aliases: ['metolar'], salts: ['metoprolol'], strength: '50mg', form: 'tablet', approx_mrp: 65.0 },
  { brand: 'Cardace 5', aliases: ['cardace'], salts: ['ramipril'], strength: '5mg', form: 'capsule', approx_mrp: 110.0 },
  { brand: 'Atorva 10', aliases: ['atorva', 'atorva10'], salts: ['atorvastatin'], strength: '10mg', form: 'tablet', approx_mrp: 95.0 },
  { brand: 'Storvas 10', aliases: ['storvas'], salts: ['atorvastatin'], strength: '10mg', form: 'tablet', approx_mrp: 90.0 },
  { brand: 'Rosuvas 10', aliases: ['rosuvas', 'rosuvas10'], salts: ['rosuvastatin'], strength: '10mg', form: 'tablet', approx_mrp: 160.0 },
  { brand: 'Crestor 10', aliases: ['crestor'], salts: ['rosuvastatin'], strength: '10mg', form: 'tablet', approx_mrp: 220.0 },
  { brand: 'Clopilet 75', aliases: ['clopilet'], salts: ['clopidogrel'], strength: '75mg', form: 'tablet', approx_mrp: 95.0 },
  { brand: 'Ecosprin 75', aliases: ['ecosprin', 'ecosprin75'], salts: ['aspirin'], strength: '75mg', form: 'tablet', approx_mrp: 12.0 },
  { brand: 'Thyronorm 50', aliases: ['thyronorm', 'thyronorm50'], salts: ['thyroxine'], strength: '50mcg', form: 'tablet', approx_mrp: 145.0 },
  { brand: 'Eltroxin 50', aliases: ['eltroxin', 'eltroxin50'], salts: ['thyroxine'], strength: '50mcg', form: 'tablet', approx_mrp: 130.0 },
  { brand: 'Thyronorm 100', aliases: ['thyronorm100'], salts: ['thyroxine'], strength: '100mcg', form: 'tablet', approx_mrp: 160.0 },
  { brand: 'Okacet', aliases: ['okacet', 'okacet 10'], salts: ['cetirizine'], strength: '10mg', form: 'tablet', approx_mrp: 18.0 },
  { brand: 'Cetzine', aliases: ['cetzine'], salts: ['cetirizine'], strength: '10mg', form: 'tablet', approx_mrp: 16.0 },
  { brand: 'Xyzal 5', aliases: ['xyzal'], salts: ['levocetirizine'], strength: '5mg', form: 'tablet', approx_mrp: 85.0 },
  { brand: 'Allegra 120', aliases: ['allegra', 'allegra120'], salts: ['fexofenadine'], strength: '120mg', form: 'tablet', approx_mrp: 180.0 },
  { brand: 'Montair 10', aliases: ['montair', 'montair10'], salts: ['montelukast'], strength: '10mg', form: 'tablet', approx_mrp: 175.0 },
  { brand: 'Telekast 10', aliases: ['telekast'], salts: ['montelukast'], strength: '10mg', form: 'tablet', approx_mrp: 150.0 },
  { brand: 'Asthalin Inhaler', aliases: ['asthalin'], salts: ['salbutamol'], strength: '100mcg', form: 'inhaler', approx_mrp: 140.0 },
  { brand: 'Combiflam', aliases: ['combiflam'], salts: ['ibuprofen', 'paracetamol'], strength: '400mg+325mg', form: 'tablet', approx_mrp: 45.0 },
  { brand: 'Brufen 400', aliases: ['brufen', 'brufen400'], salts: ['ibuprofen'], strength: '400mg', form: 'tablet', approx_mrp: 22.0 },
  { brand: 'Voveran 50', aliases: ['voveran', 'voveran50'], salts: ['diclofenac'], strength: '50mg', form: 'tablet', approx_mrp: 55.0 },
  { brand: 'Zerodol P', aliases: ['zerodol', 'zerodol p', 'zerodolp'], salts: ['aceclofenac', 'paracetamol'], strength: '100mg+325mg', form: 'tablet', approx_mrp: 75.0 },
  { brand: 'Hifenac P', aliases: ['hifenac', 'hifenac p'], salts: ['aceclofenac', 'paracetamol'], strength: '100mg+325mg', form: 'tablet', approx_mrp: 70.0 },
  { brand: 'Domstal 10', aliases: ['domstal'], salts: ['domperidone'], strength: '10mg', form: 'tablet', approx_mrp: 35.0 },
  { brand: 'Emeset 4', aliases: ['emeset'], salts: ['ondansetron'], strength: '4mg', form: 'tablet', approx_mrp: 55.0 },
  { brand: 'Shelcal 500', aliases: ['shelcal'], salts: ['calcium carbonate', 'cholecalciferol'], strength: '500mg+250iu', form: 'tablet', approx_mrp: 120.0 },
  { brand: 'Limcee 500', aliases: ['limcee'], salts: ['ascorbic acid'], strength: '500mg', form: 'tablet', approx_mrp: 25.0 },
  { brand: 'Neurobion Forte', aliases: ['neurobion'], salts: ['methylcobalamin'], strength: '1500mcg', form: 'tablet', approx_mrp: 55.0 },
  { brand: 'Pan D', aliases: ['pand', 'pan-d', 'pan d'], salts: ['pantoprazole', 'domperidone'], strength: '40mg+30mg', form: 'capsule', approx_mrp: 160.0 },
  { brand: 'Razo D', aliases: ['razo d', 'razod'], salts: ['rabeprazole', 'domperidone'], strength: '20mg+30mg', form: 'capsule', approx_mrp: 155.0 },
  { brand: 'Telma AM', aliases: ['telma am', 'telmaam'], salts: ['telmisartan', 'amlodipine'], strength: '40mg+5mg', form: 'tablet', approx_mrp: 210.0 },
  { brand: 'Telma H', aliases: ['telma h', 'telmah'], salts: ['telmisartan', 'hydrochlorothiazide'], strength: '40mg+12.5mg', form: 'tablet', approx_mrp: 175.0 },
];

// Combiflam needs ibuprofen+paracetamol combo — add if missing
const keyOf = (salts, strength) =>
  salts.map((s) => s.toLowerCase()).join('|') + '@' + strength.toLowerCase().replace(/\s+/g, '');
const gKeys = new Set(generics.map((g) => keyOf(g.salts, g.strength)));
if (!gKeys.has(keyOf(['ibuprofen', 'paracetamol'], '400mg+325mg'))) {
  add('Ibuprofen 400mg and Paracetamol 325mg Tablets', ['ibuprofen', 'paracetamol'], '400mg+325mg', 'tablet', "10's", 12.0, 'Analgesic/Antipyretic/Anti-Inflammatory');
}

const brandRows = brands.map((b) => ({
  ...b,
  note: 'approx MRP, verify on strip',
}));

fs.writeFileSync(path.join(root, 'data', 'jan_aushadhi.json'), JSON.stringify(generics, null, 2) + '\n');
fs.writeFileSync(path.join(root, 'data', 'brands.json'), JSON.stringify(brandRows, null, 2) + '\n');
console.log(`Wrote ${generics.length} generics, ${brandRows.length} brands`);

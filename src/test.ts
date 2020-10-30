import { Xfile, Xtestobject, Xtestobjectrelation, EnumXtestobjectenum_field } from './test/out';

// implementation of Xtestobject test required and type fields
class XtestobjectXmpl implements Xtestobject {
    id: string;

    string_optional_field?: string;
    short_text_field: string;
    long_text_field: string;
    richtext_field: string;
    integer_field: number;
    big_integer_field: number;
    truncated_float_field: number;
    float_field: number;
    date_field: Date;
    datetime_field: any;
    time_field: any;
    boolean_field: boolean;
    email_field: string;
    password_field: string;
    enum_field: EnumXtestobjectenum_field;
    mulitple_media_field: any[];
    single_media_field?: Xfile;
    json_field: { [key: string]: any; };
    uid_field: any;
    created_by: string;

    testobjectrelation?: Xtestobjectrelation;
    testobjectrelations: Xtestobjectrelation[];

    constructor() {
        this.id = "id"
        this.short_text_field = "short_text";
        this.long_text_field = "long_text_field";
        this.richtext_field = "richtext_field";
        this.integer_field = 1;
        this.big_integer_field = 2;
        this.truncated_float_field = 3;
        this.float_field = 4;
        this.date_field = new Date();
        this.boolean_field = true;
        this.email_field = "email_field";
        this.password_field = "password_field";
        this.enum_field = EnumXtestobjectenum_field.enum1;
        this.json_field = {};
        this.created_by = "created_by";

        this.testobjectrelations = [];

        // TOFXX => any field

        this.mulitple_media_field = [];
        this.datetime_field = {};
        this.time_field = {};
        this.uid_field = {};
    }
}

class XtestobjectrelationXmpl implements Xtestobjectrelation {
    id: string;

    testobject_one_way?: Xtestobject;
    testobject_one_one?: Xtestobject;
    testobjects_one_many: Xtestobject[];
    testobject_many_one?: Xtestobject;
    testobjects_many_many: Xtestobject[];
    testobjects_poly: Xtestobject[];

    constructor(testobject: Xtestobject) {
        this.id = "id";
        this.testobjects_one_many = [testobject];
        this.testobjects_many_many = [testobject];
        this.testobjects_poly = [testobject];
    }
}

// test optional fields
const testobject = new XtestobjectXmpl();
testobject.string_optional_field = "stringfieldoptional";

const testobjectrelation = new XtestobjectrelationXmpl(testobject);
testobjectrelation.testobject_one_way = testobject;
testobjectrelation.testobject_one_one = testobject;
testobjectrelation.testobject_many_one = testobject;